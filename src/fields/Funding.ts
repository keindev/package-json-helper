import { JSONValue } from '../types/base.js';
import { Link } from './Link.js';

export class Funding extends Link {
  /** The type of funding. */
  type?: string;

  constructor({ type, url }: { type?: string; url?: string }) {
    super(url);

    this.type = type;
  }

  getSnapshot(): JSONValue {
    const { url, type } = this;

    return type ? { url, type } : url;
  }
}
