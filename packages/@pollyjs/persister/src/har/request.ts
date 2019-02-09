import getByteLength from 'utf8-byte-length';
import setCookies from 'set-cookie-parser';
import PollyRequest from '@pollyjs/core/-private/request';

import toNVPairs, { INVPair } from './utils/to-nv-pairs';
import getFirstHeader from './utils/get-first-header';

function headersSize(request: Request) {
  const keys: string[] = [];
  const values: string[] = [];

  request.headers.forEach(({ name, value }) => {
    keys.push(name);
    values.push(value);
  });

  const headersString =
    request.method + request.url + keys.join() + values.join();

  // startline: [method] [url] HTTP/1.1\r\n = 12
  // endline: \r\n = 2
  // every header + \r\n = * 2
  // add 2 for each combined header
  return getByteLength(headersString) + keys.length * 2 + 2 + 12 + 2;
}

export default class Request {
  httpVersion: string;
  url: string;
  method: string;
  headers: INVPair[];
  headersSize: number;
  queryString: INVPair[];
  cookies: setCookies.Cookie[];
  bodySize: number;
  postData?: {
    mimeType: string;
    params: Object[];
    text?: string;
  };

  constructor(request: PollyRequest) {
    this.httpVersion = 'HTTP/1.1';
    this.url = request.absoluteUrl;
    this.method = request.method;
    this.headers = toNVPairs(request.headers as {});
    this.headersSize = headersSize(this);
    this.queryString = toNVPairs(request.query);
    this.cookies = setCookies.parse(request.getHeader('Set-Cookie'));

    if (request.body) {
      this.postData = {
        mimeType: getFirstHeader(request, 'Content-Type') || 'text/plain',
        params: []
      };

      if (typeof request.body === 'string') {
        this.postData.text = request.body;
      }
    }

    const contentLength = getFirstHeader(request, 'Content-Length');

    if (contentLength) {
      this.bodySize = parseInt(contentLength, 10);
    } else {
      this.bodySize =
        this.postData && this.postData.text
          ? getByteLength(this.postData.text)
          : 0;
    }
  }
}
