import { Maybe } from '../types';
import { cast } from '../utils/parsers';
import Field from './Field';

export abstract class Link extends Field {
  #url?: string;

  constructor(url?: string) {
    super();

    this.#url = url;
  }

  get url(): Maybe<string> {
    return this.#url;
  }

  set url(value: Maybe<string>) {
    this.#url = typeof value === 'string' ? cast.toUrl(value) : undefined;
  }
}
