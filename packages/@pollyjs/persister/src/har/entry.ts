import Request from './request';
import Response from './response';

import PollyRequest from '@pollyjs/core/-private/request';
import PollyResponse from '@pollyjs/core/-private/response';

const { keys } = Object;

interface Timings {
  [key: string]: number;

  blocked: number;
  dns: number;
  connect: number;
  send: number;
  wait: number;
  receive: number;
  ssl: number;
}

function totalTime(timings = {} as Timings) {
  return keys(timings).reduce(
    (total, k) => (timings[k] > 0 ? (total += timings[k]) : total),
    0
  );
}

export default class Entry {
  _id: string;
  _order: number;
  startedDateTime: string;
  request: Request;
  response: Response;
  cache: {} = {};
  timings: Timings;
  time: number;

  constructor(request: PollyRequest) {
    this._id = request.id as string;
    this._order = request.order as number;
    this.startedDateTime = request.timestamp as string;
    this.request = new Request(request);
    this.response = new Response(request.response as PollyResponse);
    this.timings = {
      blocked: -1,
      dns: -1,
      connect: -1,
      send: 0,
      wait: request.responseTime,
      receive: 0,
      ssl: -1
    } as Timings;
    this.time = totalTime(this.timings);
  }
}
