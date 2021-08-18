import { JSONObject } from './types';
import { cast, parsers } from './utils/parsers';
import { check, URL_REGEXP, validators } from './utils/validators';

const NAME_MAX_LENGTH = 214;

export enum Type {
  Module = 'module',
  Commonjs = 'commonjs',
}

enum StringProps {
  Browser = 'browser',
  Description = 'description',
  License = 'license',
  Main = 'main',
}

enum StringListProps {
  BundledDependencies = 'bundledDependencies',
  CPU = 'cpu',
  Files = 'files',
  Keywords = 'keywords',
  Man = 'man',
  OS = 'os',
  Workspaces = 'workspaces',
}

enum StringMapProps {
  scripts = 'scripts',
  config = 'config',
  dependencies = 'dependencies',
  devDependencies = 'devDependencies',
  optionalDependencies = 'optionalDependencies',
  peerDependencies = 'peerDependencies',
  engines = 'engines',
}

const rules = {
  name: [validators.hasValidLength('Name must be less than or equal to 214 characters', NAME_MAX_LENGTH)],
  version: [validators.isSemanticVersion('Version must be parseable by node-semver')],
  type: [validators.isEnum('Invalid package type', Object.values(Type))],
  homepage: [validators.isMatchesRegExp("Homepage can't contain any non-URL-safe characters", URL_REGEXP)],
  list: (name: string) => [validators.isStringArray(`${name} must be array of strings`)],
  map: (name: string) => [validators.isKeyValueObject(`${name} must be key-value object`)],
};

type IStringProps = { [key in StringProps]: string };
type IStringListProps = { [key in StringListProps]: Set<string> };
type IStringMapProps = { [key in StringMapProps]: Map<string, string> };

class PackageBase implements IStringProps, IStringListProps, IStringMapProps {
  #name: string;
  #version: string;
  #homepage: string;
  #type: Type;

  /** If set to `true`, then npm will refuse to publish it. */
  private: boolean;
  /** Package description, listed in `npm search`. */
  description = '';
  /** The license for the package. */
  license = '';
  /** The module ID that is the primary entry point to the program. */
  main = '';
  /** Client-side module ID that is the primary entry point. */
  browser = '';
  /** Keywords associated with package, listed in `npm search`. */
  #keywords = new Set<string>();
  /** The files included in the package. */
  #files = new Set<string>();
  /** Filenames to put in place for the `man` program to find. */
  #man = new Set<string>();
  /** Package names that are bundled when the package is published. */
  #bundledDependencies = new Set<string>();
  /** Operating systems the module runs on. */
  #os = new Set<string>();
  /** CPU architectures the module runs on. */
  #cpu = new Set<string>();
  /** Array of file patterns that describes locations within the local file system that the install client should look up to find each workspace that needs to be symlinked to the top level node_modules folder */
  #workspaces = new Set<string>();
  /** The executable files that should be installed into the `PATH`. */
  #bin = new Map<string, string>();
  /** Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point. */
  #scripts = new Map<string, string>();
  /** Is used to set configuration parameters used in package scripts that persist across upgrades. */
  #config = new Map<string, string>();
  /** The dependencies of the package. */
  #dependencies = new Map<string, string>();
  /** Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling. */
  #devDependencies = new Map<string, string>();
  /** Dependencies that are skipped if they fail to install. */
  #optionalDependencies = new Map<string, string>();
  /** Dependencies that will usually be required by the package user directly or via another dependency. */
  #peerDependencies = new Map<string, string>();
  /** Engines that this package runs on. */
  #engines = new Map<string, string>();

  constructor(data: JSONObject) {
    this.#name = parsers.getString(rules.name)(data.name);
    this.#version = parsers.getString(rules.version)(data.version);
    this.#homepage = parsers.getString(rules.homepage)(data.homepage);
    this.#type = data.type ? (parsers.getString(rules.type)(data.type) as Type) : Type.Commonjs;
    this.private = !!data.private;

    Object.values(StringProps).forEach(name => (this[name] = cast.toString(data[name])));
    Object.values(StringListProps).forEach(name =>
      (parsers.getArray(rules.list(name))(data[name]) as string[]).forEach(item => this[name].add(item))
    );
    Object.values(StringMapProps).forEach(name =>
      Object.entries(parsers.getObject(rules.map(name))(data[name]) as { [key: string]: string }).forEach(
        ([key, value]) => this[name].set(key, value)
      )
    );
  }

  /** Name of the package */
  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = check(value, rules.name);
  }

  /** Package version, parseable by [`node-semver`](https://github.com/npm/node-semver). */
  get version(): string {
    return this.#version;
  }

  set version(value: string) {
    this.#version = check(value, rules.version);
  }

  /** Resolution algorithm for importing ".js" files from the package's scope. */
  get type(): Type {
    return this.#type;
  }

  set type(value: Type) {
    this.#type = check(value, rules.type);
  }

  /** The URL to the package's homepage. */
  get homepage(): string {
    return this.#homepage;
  }

  set homepage(value: string) {
    this.#homepage = check(value, rules.homepage);
  }

  get keywords(): Set<string> {
    return this.#keywords;
  }

  get files(): Set<string> {
    return this.#files;
  }

  get man(): Set<string> {
    return this.#man;
  }

  get os(): Set<string> {
    return this.#os;
  }

  get cpu(): Set<string> {
    return this.#cpu;
  }

  get workspaces(): Set<string> {
    return this.#workspaces;
  }

  get bundledDependencies(): Set<string> {
    return this.#bundledDependencies;
  }

  get bin(): Map<string, string> {
    return this.#bin;
  }

  get scripts(): Map<string, string> {
    return this.#scripts;
  }

  get config(): Map<string, string> {
    return this.#config;
  }

  get dependencies(): Map<string, string> {
    return this.#dependencies;
  }

  get devDependencies(): Map<string, string> {
    return this.#devDependencies;
  }

  get optionalDependencies(): Map<string, string> {
    return this.#optionalDependencies;
  }

  get peerDependencies(): Map<string, string> {
    return this.#peerDependencies;
  }

  get engines(): Map<string, string> {
    return this.#engines;
  }
}

export default PackageBase;
