import { Link } from '../core/Link';
import { JSONValue } from '../types';

export class Funding extends Link {
  /** The type of funding. */
  type?: string;

  constructor({ url, type }: { url: string; type?: string }) {
    super(url);

    this.type = type;
  }

  getSnapshot(): JSONValue {
    const { url, type } = this;

    return type ? { url, type } : url;
  }
}
