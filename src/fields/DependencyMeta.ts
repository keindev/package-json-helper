import { JSONValue } from '../types';
import { parsers } from '../utils/parsers';
import { validators } from '../utils/validators';

/** This field lists some extra information related to the dependencies listed in the peerDependencies field. */
export class DependencyMeta {
  /** If true, the selected peer dependency will be marked as optional by the package manager and the consumer omitting it won't be reported as an error. */
  optional: boolean;

  constructor(data: JSONValue) {
    const meta = parsers.getObject([
      validators.hasProperties('Optional is required field of dependency meta', ['optional']),
    ])(data) as Partial<DependencyMeta>;

    this.optional = !!meta.optional;
  }
}
