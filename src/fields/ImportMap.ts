import { JSONValue } from '../types/base.js';
import { Field } from './Field.js';

// https://nodejs.org/api/packages.html#subpath-patterns
export class ImportMap extends Field {
  readonly map: Map<string, string | ImportMap>;

  constructor({ map }: { map: Map<string, string | ImportMap> }) {
    super();

    this.map = map;
  }

  getSnapshot(): JSONValue {
    if (!this.map.size) return undefined;

    return [...this.map.entries()].reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: typeof value === 'string' ? value : value.getSnapshot(),
      }),
      {}
    );
  }
}
