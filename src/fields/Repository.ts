import { JSONValue } from '../types/base.js';
import { Link } from './Link.js';

export class Repository extends Link {
  directory?: string;
  type?: string;

  constructor({ directory, type, url }: { directory?: string; type?: string; url?: string }) {
    super(url);

    this.directory = directory;
    this.type = type;
  }

  getSnapshot(): JSONValue {
    const { url, type, directory } = this;

    return type || directory ? { type, url, directory } : url;
  }
}
