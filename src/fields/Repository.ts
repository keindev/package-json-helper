import { Link } from '../core/Link';
import { JSONValue } from '../types';

export class Repository extends Link {
  type?: string;
  directory?: string;

  constructor({ url, type, directory }: { url: string; type?: string; directory?: string }) {
    super(url);

    this.type = type;
    this.directory = directory;
  }

  getSnapshot(): JSONValue {
    const { url, type, directory } = this;

    return type || directory ? { type, url, directory } : url;
  }
}
