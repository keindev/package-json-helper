import { cast } from '../utils/parsers';

export class URL {
  #url = '';

  get url(): string {
    return this.#url;
  }

  set url(value: string) {
    this.#url = cast.toUrl(value);
  }
}
