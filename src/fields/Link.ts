import { cast } from '../utils/parsers';
import { URL } from './URL';

export class Link extends URL {
  #email = '';

  get email(): string {
    return this.#email;
  }

  set email(value: string) {
    this.#email = cast.toEmail(value);
  }
}
