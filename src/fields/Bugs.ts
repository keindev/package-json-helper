import { Link } from '../core/Link';
import { JSONValue, Maybe } from '../types';
import { cast } from '../utils/parsers';

export class BugsLocation extends Link {
  #email?: string;

  constructor({ email, url }: { email?: string; url: string }) {
    super(url);

    this.email = email;
  }

  get email(): Maybe<string> {
    return this.#email;
  }

  set email(value: Maybe<string>) {
    this.#email = typeof value === 'string' ? cast.toEmail(value) : value;
  }

  getSnapshot(): JSONValue {
    const { url, email } = this;

    return email ? { url, email } : url;
  }
}
