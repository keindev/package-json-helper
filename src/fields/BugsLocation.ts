import { JSONValue } from '../types/base.js';
import { Info } from './Info.js';

export class BugsLocation extends Info {
  getSnapshot(): JSONValue {
    const { url, email } = this;

    return email ? { url, email } : url;
  }
}
