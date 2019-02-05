import isObjectLike from 'lodash-es/isObjectLike';

const { keys } = Object;

export type HeaderValue = string | string[] | null | undefined;

export interface IHTTPHeaders {
  [key: string]: HeaderValue;
}

const HANDLER = {
  get(obj: {}, prop: string | symbol): any {
    return obj[typeof prop === 'string' ? prop.toLowerCase() : prop];
  },

  set(obj: {}, prop: string | symbol, value: any): boolean {
    if (typeof prop !== 'string') {
      return false;
    }

    if (value === null || typeof value === 'undefined') {
      delete obj[prop.toLowerCase()];
    } else {
      obj[prop.toLowerCase()] = value;
    }

    return true;
  },

  deleteProperty(obj, prop) {
    if (typeof prop !== 'string') {
      return false;
    }

    delete obj[prop.toLowerCase()];

    return true;
  }
};

export default function HTTPHeaders(headers?: {}): IHTTPHeaders {
  const proxy = <IHTTPHeaders>new Proxy({}, HANDLER);

  if (isObjectLike(headers)) {
    keys(headers).forEach(h => (proxy[h] = headers[h]));
  }

  return proxy;
}
