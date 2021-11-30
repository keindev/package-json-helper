import { JSONValue } from '../types';
import { Info } from './Info';

export class Person extends Info {
  name: string;

  constructor({ email, name, url }: { email?: string; name: string; url?: string }) {
    super({ email, url });

    this.name = name;
  }

  getSnapshot(): JSONValue {
    const { name, url, email } = this;

    if (url && email) return `${name} <${email}> (${url})`;
    if (url || email) return { name, url, email };

    return name;
  }
}
