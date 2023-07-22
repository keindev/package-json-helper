import { JSONValue } from '../types/base.js';
import { Field } from './Field.js';

// https://nodejs.org/api/packages.html#subpath-patterns
export class ExportMap extends Field {
  readonly map: Map<string, string | ExportMap | null>;

  constructor({ map }: { map: Map<string, string | ExportMap | null> }) {
    super();

    this.map = map;
  }

  getSnapshot(): JSONValue {
    if (!this.map.size) return undefined;
    if (this.map.size === 1) return this.map.values().next().value;

    return [...this.map.entries()].reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: typeof value === 'string' || value === null ? value : value.getSnapshot(),
      }),
      {}
    );
  }
}
