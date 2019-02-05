import Log from './log';

export default class HAR {
  log!: Log;

  constructor(opts = {} as HAR) {
    this.log = new Log(opts.log);
  }
}
