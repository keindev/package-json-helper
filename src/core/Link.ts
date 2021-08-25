import { cast } from '../utils/parsers';
import Field from './Field';

export class Link extends Field {
  #url: string;

  constructor(url: string) {
    super();

    this.#url = url;
  }

  get url(): string {
    return this.#url;
  }

  set url(value: string) {
    this.#url = cast.toUrl(value) || '';
  }
}
