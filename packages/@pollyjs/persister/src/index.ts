import stringify from 'fast-json-stable-stringify';
import { ACTIONS, assert } from '@pollyjs/utils';
import Polly from '@pollyjs/core/polly';
import PollyRequest from '@pollyjs/core/-private/request';
import PollyResponse from '@pollyjs/core/-private/response';

import HAR from './har';
import Entry from './har/entry';

const CREATOR_NAME = 'Polly.JS';

export default class Persister {
  polly: Polly;
  pending: Map<string, { name: string; requests: PollyRequest[] }> = new Map();
  private _cache: Map<string, Promise<HAR | null>> = new Map();

  constructor(polly: Polly) {
    this.polly = polly;
  }

  static get type() {
    return 'persister';
  }

  // @ts-ignore
  static get name() {
    assert('Must override the static `name` getter.');

    return 'base';
  }

  get defaultOptions() {
    return {};
  }

  get options() {
    const { name } = this.constructor;

    return {
      ...(this.defaultOptions || {}),
      ...((this.polly.config.persisterOptions || {})[name] || {})
    };
  }

  get hasPending() {
    /*
      Although the pending map is bucketed by recordingId, the bucket will always
      be created with a single item in it so we can assume that if a bucket
      exists, then it has items in it.
    */
    return this.pending.size > 0;
  }

  async persist() {
    if (!this.hasPending) {
      return;
    }

    const promises: Promise<void>[] = [];
    const { type, name } = this.constructor as typeof Persister;
    const { VERSION } = this.polly.constructor as typeof Polly;

    const creator = {
      name: CREATOR_NAME,
      version: VERSION,
      comment: `${type}:${name}`
    };

    for (const [recordingId, { name, requests }] of this.pending) {
      const entries = [];
      const recording = await this.find(recordingId);
      let har;

      if (!recording) {
        har = new HAR({ log: { creator, _recordingName: name } } as HAR);
      } else {
        har = new HAR(recording);
      }

      for (const request of requests) {
        const entry = new Entry(request);

        this.assert(
          `Cannot persist response for [${entry.request.method}] ${
            entry.request.url
          } because the status code was ${
            entry.response.status
          } and \`recordFailedRequests\` is \`false\``,
          (<PollyResponse>request.response).ok ||
            request.config.recordFailedRequests
        );

        /*
          Trigger the `beforePersist` event on each new recorded entry.

          NOTE: This must be triggered last as this entry can be used to
                modify the payload (i.e. encrypting the request & response).
        */
        await request._emit('beforePersist', entry);
        entries.push(entry);
      }

      har.log.addEntries(entries);

      if (!this.polly.config.persisterOptions.keepUnusedRequests) {
        this._removeUnusedEntries(recordingId, har);
      }

      promises.push(this.save(recordingId, har));
    }

    await Promise.all(promises);
    this.pending.clear();
  }

  recordRequest(pollyRequest: PollyRequest) {
    this.assert(
      `You must pass a PollyRequest to 'recordRequest'.`,
      pollyRequest
    );
    this.assert(
      `Cannot save a request with no response.`,
      pollyRequest.didRespond
    );

    const { recordingId, recordingName } = pollyRequest;

    if (!this.pending.has(recordingId)) {
      this.pending.set(recordingId, { name: recordingName, requests: [] });
    }

    this.pending.get(recordingId)!.requests.push(pollyRequest);
  }

  async find(recordingId: string) {
    const { _cache: cache } = this;

    if (!cache.has(recordingId)) {
      const findRecording = async () => {
        const recording = await this.findRecording(recordingId);

        if (recording) {
          this.assert(
            `Recording with id '${recordingId}' is invalid. Please delete the recording so a new one can be created.`,
            recording.log && recording.log.creator!.name === CREATOR_NAME
          );

          return recording;
        } else {
          cache.delete(recordingId);

          return null;
        }
      };

      cache.set(recordingId, findRecording());
    }

    return cache.get(recordingId);
  }

  async save(recordingId: string, har: HAR) {
    await this.saveRecording(recordingId, har);
    this._cache.delete(recordingId);
  }

  async delete(recordingId: string) {
    await this.deleteRecording(recordingId);
    this._cache.delete(recordingId);
  }

  async findEntry(pollyRequest: PollyRequest) {
    const { id, order, recordingId } = pollyRequest;
    const recording = await this.find(recordingId);

    return (
      (recording &&
        recording.log.entries.find(
          entry => entry._id === id && entry._order === order
        )) ||
      null
    );
  }

  stringify(data: any, options?: {}) {
    return stringify(data, options);
  }

  assert(message: string, condition?: unknown) {
    const { type, name } = this.constructor as typeof Persister;

    assert(`[${type}:${name}] ${message}`, condition);
  }

  /**
   * Remove all entries from the given HAR that do not match any requests in
   * the current Polly instance.
   *
   * @param {String} recordingId
   * @param {HAR} har
   */
  _removeUnusedEntries(recordingId: string, har: HAR) {
    const requests = this.polly._requests.filter(
      r =>
        r.recordingId === recordingId &&
        (r.action === ACTIONS.RECORD || r.action === ACTIONS.REPLAY)
    );

    har.log.entries = har.log.entries.filter(entry =>
      requests.find(r => entry._id === r.id && entry._order === r.order)
    );
  }

  async findRecording(recordingId: string): Promise<HAR | null> {
    this.assert('Must implement the `findRecording` hook.');

    return null;
  }

  async saveRecording(recordingId: string, har: HAR) {
    this.assert('Must implement the `saveRecording` hook.');
  }

  async deleteRecording(recordingId: string) {
    this.assert('Must implement the `deleteRecording` hook.');
  }
}
