import { Maybe } from '../types';
import { cast } from '../utils/parsers';
import { Link } from './Link';

export abstract class Info extends Link {
  #email?: string;

  constructor({ email, url }: { email?: string; url?: string }) {
    super(url);

    this.email = email;
  }

  get email(): Maybe<string> {
    return this.#email;
  }

  set email(value: Maybe<string>) {
    this.#email = typeof value === 'string' ? cast.toEmail(value) : value;
  }
}
