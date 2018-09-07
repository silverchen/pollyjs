import { Polly } from '@pollyjs/core';
import XHRAdapter from '@pollyjs/adapter-xhr';
import FetchAdapter from '@pollyjs/adapter-fetch';
import RESTPersister from '@pollyjs/persister-rest';
import LocalStoragePersister from '@pollyjs/persister-local-storage';

Polly.register(XHRAdapter);
Polly.register(FetchAdapter);
Polly.register(RESTPersister);
Polly.register(LocalStoragePersister);
