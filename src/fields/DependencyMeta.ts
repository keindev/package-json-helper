import { JSONValue } from '../types/base.js';
import { Field } from './Field.js';

/** This field lists some extra information related to the dependencies listed in the peerDependencies field. */
export class DependencyMeta extends Field {
  name: string;
  /** If true, the selected peer dependency will be marked as optional by the package manager and the consumer omitting it won't be reported as an error. */
  optional: boolean;

  constructor({ name, optional }: { name: string; optional: boolean }) {
    super();

    this.name = name;
    this.optional = optional;
  }

  getSnapshot(): JSONValue {
    return { optional: this.optional };
  }
}
