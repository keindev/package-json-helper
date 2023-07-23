import { Maybe } from '../types/base.js';
import { cast } from '../utils/parsers.js';
import { Field } from './Field.js';

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
