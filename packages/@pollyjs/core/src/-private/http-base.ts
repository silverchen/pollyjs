import stringify from 'fast-json-stable-stringify';

import HTTPHeaders from '../utils/http-headers';

const { freeze } = Object;
const { parse } = JSON;

export default class HTTPBase {
  headers: { [key: string]: string | string[] | null };
  body?: string;

  constructor() {
    this.headers = HTTPHeaders();
  }

  getHeader(name: string): string | string[] {
    return this.headers[name];
  }

  setHeader(name: string, value?: string | string[] | null): this {
    this.headers[name] = value;

    return this;
  }

  setHeaders(headers = {}) {
    for (const name in headers) {
      this.setHeader(name, headers[name]);
    }

    return this;
  }

  removeHeader(name: string) {
    this.setHeader(name, null);

    return this;
  }

  removeHeaders(headers: string[] = []) {
    for (const name of headers) {
      this.removeHeader(name);
    }

    return this;
  }

  hasHeader(name: string): boolean {
    return !!this.getHeader(name);
  }

  type(type: string): this {
    return this.setHeader('Content-Type', type);
  }

  send(data: any): this {
    let body = data;

    switch (typeof body) {
      case 'string':
        // String defaulting to html
        if (!this.hasHeader('Content-Type')) {
          this.type('text/html');
        }

        break;
      case 'boolean':
      case 'number':
      case 'object':
        if (body === null) {
          body = '';
        } else {
          return this.json(body);
        }

        break;
    }

    if (typeof body === 'string') {
      const contentType = this.getHeader('Content-Type');

      // Write strings in utf-8
      if (contentType && !contentType.includes('charset')) {
        this.type(`${contentType}; charset=utf-8`);
      }
    }

    this.body = body;

    return this;
  }

  json(obj?: {}): this {
    if (!this.hasHeader('Content-Type')) {
      this.type('application/json');
    }

    return this.send(stringify(obj));
  }

  jsonBody(): {} {
    return parse(this.body);
  }

  end(): this {
    freeze(this);
    freeze(this.headers);

    return this;
  }
}
