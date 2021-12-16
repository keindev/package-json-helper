import cloneDeep from 'lodash.clonedeep';

import { JSONObject, Maybe, PackageType } from '../types';
import { parsers } from '../utils/parsers';
import rules from '../utils/rules';
import { check } from '../utils/validators';

abstract class AbstractPackage {
  #homepage?: string;
  #name = '';
  #nameWithoutScope = '';
  #scope?: string;
  #type: PackageType;
  #version: string;

  // raw package object
  protected data: JSONObject;

  constructor(data: JSONObject) {
    this.data = cloneDeep(data);
    this.name = data.name ? parsers.getString(rules.name)(data.name) || '' : '';
    this.#version = parsers.getString(rules.version)(data.version) || '';
    this.#homepage = parsers.getString(rules.homepage)(data.homepage);
    this.#type = data.type ? (parsers.getString(rules.type)(data.type) as PackageType) : PackageType.Commonjs;
  }

  /** Name of the package */
  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = check(value, rules.name);

    const { scope, name } = this.#name.match(/^@(?<scope>[\w.-]+)\/(?<name>[\w.-]+)/i)?.groups ?? {};

    this.#scope = scope;
    this.#nameWithoutScope = name ?? this.name;
  }

  get scope(): Maybe<string> {
    return this.#scope;
  }

  get nameWithoutScope(): string {
    return this.#nameWithoutScope;
  }

  /** Package version, parseable by [`node-semver`](https://github.com/npm/node-semver). */
  get version(): string {
    return this.#version;
  }

  set version(value: string) {
    this.#version = check(value, rules.version);
  }

  /** Resolution algorithm for importing ".js" files from the package's scope. */
  get type(): PackageType {
    return this.#type;
  }

  set type(value: PackageType) {
    this.#type = check(value, rules.type);
  }

  /** The URL to the package's homepage. */
  get homepage(): Maybe<string> {
    return this.#homepage;
  }

  set homepage(value: Maybe<string>) {
    this.#homepage = value && check(value, rules.homepage);
  }
}

export default AbstractPackage;
