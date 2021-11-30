import semver from 'semver';

import { JSONValue, Maybe } from '../types';
import Field from './Field';

export class Dependency extends Field {
  readonly name: string;

  #version?: string;

  constructor(name: string, version: string) {
    super();

    this.name = name;
    this.#version = version;
  }

  get version(): Maybe<string> {
    return this.#version;
  }

  set version(version: Maybe<string>) {
    this.#version = semver.coerce(version) ? version : undefined;
  }

  getSnapshot(): JSONValue {
    return this.#version;
  }

  isSatisfy(version: string): boolean {
    return !!this.#version && (semver.satisfies(version, this.#version) || semver.subset(version, this.#version));
  }
}
