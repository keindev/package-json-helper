import Field from '../core/Field';
import { JSONValue, Maybe } from '../types';
import { cast } from '../utils/parsers';

export class Person extends Field {
  #email?: string;
  #url?: string;

  name: string;

  constructor({ name, url, email }: { name: string; url?: string; email?: string }) {
    super();

    this.name = name;
    this.url = url;
    this.email = email;
  }

  get email(): Maybe<string> {
    return this.#email;
  }

  set email(value: Maybe<string>) {
    this.#email = typeof value === 'string' ? cast.toEmail(value) : value;
  }

  get url(): Maybe<string> {
    return this.#url;
  }

  set url(value: Maybe<string>) {
    this.#url = typeof value === 'string' ? cast.toUrl(value) : value;
  }

  getSnapshot(): JSONValue {
    const { name, url, email } = this;

    if (url && email) return `${name} <${email}> (${url})`;
    if (url || email) return { name, url, email };

    return name;
  }
}
