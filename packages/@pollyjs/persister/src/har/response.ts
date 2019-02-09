import getByteLength from 'utf8-byte-length';
import setCookies from 'set-cookie-parser';
import PollyResponse from '@pollyjs/core/-private/response';

import toNVPairs, { INVPair } from './utils/to-nv-pairs';
import getFirstHeader from './utils/get-first-header';

function headersSize(response: Response) {
  const keys: string[] = [];
  const values: string[] = [];

  response.headers.forEach(({ name, value }) => {
    keys.push(name);
    values.push(value);
  });

  const headersString = keys.join() + values.join();

  // endline: \r\n = 2
  // every header + \r\n = * 2
  // add 2 for each combined header
  return getByteLength(headersString) + keys.length * 2 + 2 + 2;
}

export default class Response {
  httpVersion: string;
  status: number;
  statusText: string;
  headers: INVPair[];
  headersSize: number;
  redirectURL: string;
  cookies: setCookies.Cookie[];
  bodySize: number;
  content: {
    mimeType: string;
    size: number;
    text?: string;
  };

  constructor(response: PollyResponse) {
    this.httpVersion = 'HTTP/1.1';
    this.status = response.statusCode;
    this.statusText = response.statusText;
    this.headers = toNVPairs(response.headers as {});
    this.headersSize = headersSize(this);
    this.cookies = setCookies.parse(response.getHeader('Set-Cookie'));
    this.redirectURL = getFirstHeader(response, 'Location') || '';

    this.content = {
      mimeType: getFirstHeader(response, 'Content-Type') || 'text/plain',
      size: 0
    };

    if (response.body && typeof response.body === 'string') {
      this.content.text = response.body;
    }

    const contentLength = getFirstHeader(response, 'Content-Length');

    if (contentLength) {
      this.content.size = parseInt(contentLength, 10);
    } else {
      this.content.size = this.content.text
        ? getByteLength(this.content.text)
        : 0;
    }

    this.bodySize = this.content.size;
  }
}
