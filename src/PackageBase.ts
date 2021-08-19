import { BugsLocation } from './fields/Bugs';
import { DependencyMeta } from './fields/DependencyMeta';
import { Funding } from './fields/Funding';
import { Person } from './fields/Person';
import { Repository } from './fields/Repository';
import { JSONObject } from './types';
import { mappers } from './utils/mappers';
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
  Types = 'types',
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
  Scripts = 'scripts',
  Config = 'config',
  Dependencies = 'dependencies',
  DevDependencies = 'devDependencies',
  OptionalDependencies = 'optionalDependencies',
  PeerDependencies = 'peerDependencies',
  Engines = 'engines',
  Directories = 'directories',
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
  /** If set to `true`, then npm will refuse to publish it. */
  private: boolean;
  /** Package description, listed in `npm search`. */
  description = '';
  /** The license for the package. */
  license = '';
  /** The module ID that is the primary entry point to the program. */
  main = '';
  /** Point to bundled declaration file. */
  types = '';
  /** Client-side module ID that is the primary entry point. */
  browser = '';

  #name: string;
  #version: string;
  #homepage: string;
  #type: Type;
  #keywords = new Set<string>();
  #files = new Set<string>();
  #man = new Set<string>();
  #bundledDependencies = new Set<string>();
  #os = new Set<string>();
  #cpu = new Set<string>();
  #workspaces = new Set<string>();
  #bin = new Map<string, string>();
  #scripts = new Map<string, string>();
  #config = new Map<string, string>();
  #dependencies = new Map<string, string>();
  #devDependencies = new Map<string, string>();
  #optionalDependencies = new Map<string, string>();
  #peerDependencies = new Map<string, string>();
  #engines = new Map<string, string>();
  #directories = new Map<string, string>();
  #bugs: BugsLocation;
  #author: Person;
  #repository: Repository;
  #contributors: Map<string, Person>;
  #maintainers: Map<string, Person>;
  #funding: Map<string, Funding>;
  #peerDependenciesMeta: Map<string, DependencyMeta>;
  #publishConfig: Map<string, string | number | boolean>;

  protected data: JSONObject;

  constructor(data: JSONObject) {
    this.data = data;
    this.private = !!data.private;
    this.#name = parsers.getString(rules.name)(data.name);
    this.#version = parsers.getString(rules.version)(data.version);
    this.#homepage = parsers.getString(rules.homepage)(data.homepage);
    this.#type = data.type ? (parsers.getString(rules.type)(data.type) as Type) : Type.Commonjs;
    this.#bugs = new BugsLocation(data.bugs);
    this.#author = new Person(data.author);
    this.#repository = new Repository(data.repository);
    this.#bin = mappers.toBin(data.bin);
    this.#contributors = mappers.toPersons(data.contributors);
    this.#maintainers = mappers.toPersons(data.maintainers);
    this.#funding = mappers.toFunding(data.funding);
    this.#peerDependenciesMeta = mappers.toDependencyMeta(data.peerDependenciesMeta);
    this.#publishConfig = mappers.toPublishConfig(data.publishConfig);

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

  /** Keywords associated with package, listed in `npm search`. */
  get keywords(): Set<string> {
    return this.#keywords;
  }

  /** The files included in the package. */
  get files(): Set<string> {
    return this.#files;
  }

  /** Filenames to put in place for the `man` program to find. */
  get man(): Set<string> {
    return this.#man;
  }

  /** Operating systems the module runs on. */
  get os(): Set<string> {
    return this.#os;
  }

  /** CPU architectures the module runs on. */
  get cpu(): Set<string> {
    return this.#cpu;
  }

  /** Array of file patterns that describes locations within the local file system that the install client should look up to find each workspace that needs to be symlinked to the top level node_modules folder */
  get workspaces(): Set<string> {
    return this.#workspaces;
  }

  /** Package names that are bundled when the package is published. */
  get bundledDependencies(): Set<string> {
    return this.#bundledDependencies;
  }

  /** The executable files that should be installed into the `PATH`. */
  get bin(): Map<string, string> {
    return this.#bin;
  }

  /** Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point. */
  get scripts(): Map<string, string> {
    return this.#scripts;
  }

  /** Is used to set configuration parameters used in package scripts that persist across upgrades. */
  get config(): Map<string, string> {
    return this.#config;
  }

  /** The dependencies of the package. */
  get dependencies(): Map<string, string> {
    return this.#dependencies;
  }

  /** Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling. */
  get devDependencies(): Map<string, string> {
    return this.#devDependencies;
  }

  /** Dependencies that are skipped if they fail to install. */
  get optionalDependencies(): Map<string, string> {
    return this.#optionalDependencies;
  }

  /** Dependencies that will usually be required by the package user directly or via another dependency. */
  get peerDependencies(): Map<string, string> {
    return this.#peerDependencies;
  }

  /** Engines that this package runs on. */
  get engines(): Map<string, string> {
    return this.#engines;
  }

  /** Indicates the structure of the package. */
  get directories(): Map<string, string> {
    return this.#directories;
  }

  /** The URL to the package's issue tracker and/or the email address to which issues should be reported. */
  get bugs(): BugsLocation {
    return this.#bugs;
  }

  /** Author of the package */
  get author(): Person {
    return this.#author;
  }

  /** Location for the code repository. */
  get repository(): Repository {
    return this.#repository;
  }

  /** A list of people who contributed to the package. */
  get contributors(): Map<string, Person> {
    return this.#contributors;
  }

  /** A list of people who maintain the package. */
  get maintainers(): Map<string, Person> {
    return this.#maintainers;
  }

  /** Describes and notifies consumers of a package's monetary support information. */
  get funding(): Map<string, Funding> {
    return this.#funding;
  }

  /** Indicate peer dependencies that are optional. */
  get peerDependenciesMeta(): Map<string, DependencyMeta> {
    return this.#peerDependenciesMeta;
  }

  /** A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default. */
  get publishConfig(): Map<string, string | number | boolean> {
    return this.#publishConfig;
  }
}

export default PackageBase;
