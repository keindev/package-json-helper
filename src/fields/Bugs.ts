import { JSONValue } from '../types';
import { Info } from './Info';

export class BugsLocation extends Info {
  getSnapshot(): JSONValue {
    const { url, email } = this;

    return email ? { url, email } : url;
  }
}
