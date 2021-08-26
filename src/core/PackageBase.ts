import cloneDeep from 'lodash.clonedeep';

import { BugsLocation } from '../fields/Bugs';
import { DependencyMeta } from '../fields/DependencyMeta';
import { Funding } from '../fields/Funding';
import { Person } from '../fields/Person';
import { Repository } from '../fields/Repository';
import { JSONObject, Maybe } from '../types';
import { cast, parsers } from '../utils/parsers';
import { replacer } from '../utils/replacer';
import { check, URL_REGEXP, validators } from '../utils/validators';

const NAME_MAX_LENGTH = 214;
const TAB_WIDTH = 2;

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

type IStringProps = { [key in StringProps]?: string };
type IStringListProps = { [key in StringListProps]?: Set<string> };
type IStringMapProps = { [key in StringMapProps]?: Map<string, string> };

const rules = {
  name: [validators.hasValidLength('Name must be less than or equal to 214 characters', NAME_MAX_LENGTH)],
  version: [validators.isSemanticVersion('Version must be parseable by node-semver')],
  type: [validators.isEnum('Invalid package type', Object.values(Type))],
  homepage: [validators.isMatchesRegExp("Homepage can't contain any non-URL-safe characters", URL_REGEXP)],
};

class PackageBase implements IStringProps, IStringListProps, IStringMapProps {
  /** If set to `true`, then npm will refuse to publish it. */
  private: boolean;
  /** Package description, listed in `npm search`. */
  description?: string;
  /** The license for the package. */
  license?: string;
  /** The module ID that is the primary entry point to the program. */
  main?: string;
  /** Point to bundled declaration file. */
  types?: string;
  /** Client-side module ID that is the primary entry point. */
  browser?: string;

  #name = '';
  #nameWithoutScope = '';
  #scope?: string;
  #version: string;
  #homepage?: string;
  #type: Type;
  /** Keywords associated with package, listed in `npm search`. */
  keywords?: Set<string>;
  /** The files included in the package. */
  files?: Set<string>;
  /** Filenames to put in place for the `man` program to find. */
  man?: Set<string>;
  /** Package names that are bundled when the package is published. */
  bundledDependencies?: Set<string>;
  /** Operating systems the module runs on. */
  os?: Set<string>;
  /** CPU architectures the module runs on. */
  cpu?: Set<string>;
  /** Array of file patterns that describes locations within the local file system that the install client should look up to find each workspace that needs to be symlinked to the top level node_modules folder */
  workspaces?: Set<string>;
  /** Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point. */
  scripts?: Map<string, string>;
  /** Is used to set configuration parameters used in package scripts that persist across upgrades. */
  config?: Map<string, string>;
  /** The dependencies of the package. */
  dependencies?: Map<string, string>;
  /** Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling. */
  devDependencies?: Map<string, string>;
  /** Dependencies that are skipped if they fail to install. */
  optionalDependencies?: Map<string, string>;
  /** Dependencies that will usually be required by the package user directly or via another dependency. */
  peerDependencies?: Map<string, string>;
  /** Engines that this package runs on. */
  engines?: Map<string, string>;
  /** Indicates the structure of the package. */
  directories?: Map<string, string>;
  /** The URL to the package's issue tracker and/or the email address to which issues should be reported. */
  bugs?: BugsLocation;
  /** Author of the package */
  author?: Person;
  /** Location for the code repository. */
  repository?: Repository;
  /** A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default. */
  publishConfig: Map<string, string | number | boolean>;
  /** The executable files that should be installed into the `PATH`. */
  bin: Map<string, string>;
  /** A list of people who contributed to the package. */
  contributors: Map<string, Person>;
  /** A list of people who maintain the package. */
  maintainers: Map<string, Person>;
  /** Describes and notifies consumers of a package's monetary support information. */
  funding: Map<string, Funding>;
  /** Indicate peer dependencies that are optional. */
  peerDependenciesMeta: Map<string, DependencyMeta>;

  protected data: JSONObject;

  constructor(data: JSONObject) {
    this.data = cloneDeep(data);
    this.private = !!data.private;
    this.name = parsers.getString(rules.name)(data.name) || '';
    this.#version = parsers.getString(rules.version)(data.version) || '';
    this.#homepage = parsers.getString(rules.homepage)(data.homepage);
    this.#type = data.type ? (parsers.getString(rules.type)(data.type) as Type) : Type.Commonjs;
    this.bugs = cast.toBugsLocation(data.bugs);
    this.author = cast.toPerson(data.author);
    this.repository = cast.toRepository(data.repository);
    this.bin = cast.toBin(this.nameWithoutScope, data.bin);
    this.contributors = cast.toPersons(data.contributors);
    this.maintainers = cast.toPersons(data.maintainers);
    this.funding = cast.toFundingList(data.funding);
    this.peerDependenciesMeta = cast.toDependencyMeta(data.peerDependenciesMeta);
    this.publishConfig = cast.toPublishConfig(data.publishConfig);

    Object.values(StringProps).forEach(name => (this[name] = cast.toString(data[name])));
    Object.values(StringListProps).forEach(name => (this[name] = cast.toSet(data[name])));
    Object.values(StringMapProps).forEach(name => (this[name] = cast.toMap(data[name])));
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
  get type(): Type {
    return this.#type;
  }

  set type(value: Type) {
    this.#type = check(value, rules.type);
  }

  /** The URL to the package's homepage. */
  get homepage(): Maybe<string> {
    return this.#homepage;
  }

  set homepage(value: Maybe<string>) {
    this.#homepage = value && check(value, rules.homepage);
  }

  // eslint-disable-next-line max-lines-per-function
  toString(): string {
    return JSON.stringify(
      {
        name: this.name,
        version: this.version,
        description: this.description,
        license: this.license,
        private: this.private || undefined,
        homepage: this.homepage,
        author: this.author,
        contributors: this.contributors,
        maintainers: this.maintainers,
        keywords: this.keywords,
        funding: this.funding,
        bugs: this.bugs,
        types: this.types,
        browser: this.browser,
        type: this.type,
        files: this.files,
        workspaces: this.workspaces,
        directories: this.directories,
        main: this.main,
        bin: this.bin,
        man: this.man,
        repository: this.repository,
        config: this.config,
        publishConfig: this.publishConfig,
        os: this.os,
        cpu: this.cpu,
        engines: this.engines,
        scripts: this.scripts,
        dependencies: this.dependencies,
        devDependencies: this.devDependencies,
        peerDependencies: this.peerDependencies,
        peerDependenciesMeta: this.peerDependenciesMeta,
        bundledDependencies: this.bundledDependencies,
        optionalDependencies: this.optionalDependencies,
      },
      replacer,
      TAB_WIDTH
    );
  }
}

export default PackageBase;
