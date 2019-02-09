import { MODES } from '@pollyjs/utils';
import Timing from '../utils/timing';

export interface IPollyConfig {
  mode: string;
  logging: boolean;
  recordIfMissing: boolean;
  recordIfExpired: boolean;
  recordFailedRequests: boolean;
  expiresIn?: string | null;
  timing: Function;
  adapters: (string | Function)[];
  adapterOptions: {
    [key: string]: any;
  };
  persister?: string | Function | null;
  persisterOptions: {
    [key: string]: any;
    keepUnusedRequests: boolean;
  };

  matchRequestsBy: {
    method: boolean | Function;
    headers: boolean | Function | { excludes: string[] };
    body: boolean | Function;
    order: boolean;
    url: {
      protocol: boolean | Function;
      username: boolean | Function;
      password: boolean | Function;
      hostname: boolean | Function;
      port: boolean | Function;
      pathname: boolean | Function;
      query: boolean | Function;
      hash: boolean | Function;
    };
  };
}

export default {
  mode: MODES.REPLAY,

  adapters: [],
  adapterOptions: {},

  persister: null,
  persisterOptions: {
    keepUnusedRequests: false
  },

  logging: false,

  recordIfMissing: true,
  recordIfExpired: false,
  recordFailedRequests: false,

  expiresIn: null,
  timing: Timing.fixed(0),

  matchRequestsBy: {
    method: true,
    headers: true,
    body: true,
    order: true,

    url: {
      protocol: true,
      username: true,
      password: true,
      hostname: true,
      port: true,
      pathname: true,
      query: true,
      hash: false
    }
  }
} as IPollyConfig;
