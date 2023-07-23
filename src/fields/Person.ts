import { JSONValue } from '../types/base.js';
import { Info } from './Info.js';

export class Person extends Info {
  name: string;

  constructor({ email, name, url }: { email?: string; name: string; url?: string }) {
    super({ email, url });

    this.name = name;
  }

  getSnapshot(): JSONValue {
    const { name, url, email } = this;

    return [name, (email && ` <${email}>`) || '', (url && ` (${url})`) || ''].join('');
  }
}
