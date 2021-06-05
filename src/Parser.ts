import { JSONObject } from './types';
import { parse } from './utils/parsers';
import { checkValue, validationMaps } from './utils/validators';

enum StringProps {
  description = 'description',
  license = 'license',
  main = 'main',
  browser = 'browser',
}

enum StringListProps {
  keywords = 'keywords',
  files = 'files',
  bundledDependencies = 'bundledDependencies',
  os = 'os',
  cpu = 'cpu',
  workspaces = 'workspaces',
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

type IPackageStringProps = { [key in StringProps]?: string };
type IPackageStringListProps = { [key in StringListProps]?: string };
type IPackageStringMapProps = { [key in StringMapProps]?: string };

class Parser implements IPackageStringProps, IPackageStringListProps, IPackageStringMapProps {
  #data: JSONObject;
  #name: string;
  #version: string;

  /** Package description, listed in `npm search`. */
  description?: string;
  /** Keywords associated with package, listed in `npm search`. */
  keywords: Set<string>;
  /** The URL to the package's homepage. */
  #homepage?: string;
  /** The URL to the package's issue tracker and/or the email address to which issues should be reported. */
  #bugs?: IBugsLocation;
  /** The license for the package. */
  license?: string;
  /** Author of the package */
  #author?: IPerson;
  /** A list of people who contributed to the package. */
  #contributors: IPerson[];
  /** A list of people who maintain the package. */
  #maintainers: IPerson[];
  /** Describes and notifies consumers of a package's monetary support information. */
  #funding: IFunding[];
  /** The files included in the package. */
  files: Set<string>;
  /** Resolution algorithm for importing ".js" files from the package's scope. */
  #type: Type;
  /** The module ID that is the primary entry point to the program. */
  main?: string;
  /** Client-side module ID that is the primary entry point. */
  browser?: string;
  /** The executable files that should be installed into the `PATH`. */
  #bin: Map<string, string>;
  /** Filenames to put in place for the `man` program to find. */
  #man: Set<string>;
  /** Indicates the structure of the package. */
  #directories?: IDirectoryLocations;
  /** Location for the code repository. */
  #repository?: IRepository;
  /** Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point. */
  scripts: Map<string, string>;
  /** Is used to set configuration parameters used in package scripts that persist across upgrades. */
  config: Map<string, string>;
  /** The dependencies of the package. */
  dependencies: Map<string, string>;
  /** Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling. */
  devDependencies: Map<string, string>;
  /** Dependencies that are skipped if they fail to install. */
  optionalDependencies: Map<string, string>;
  /** Dependencies that will usually be required by the package user directly or via another dependency. */
  peerDependencies: Map<string, string>;
  /** Indicate peer dependencies that are optional. */
  #peerDependenciesMeta: Map<string, boolean>;
  /** Package names that are bundled when the package is published. */
  bundledDependencies: Set<string>;
  /** Engines that this package runs on. */
  engines: Map<string, string>;
  /** Operating systems the module runs on. */
  os: Set<string>;
  /** CPU architectures the module runs on. */
  cpu: Set<string>;
  /** If set to `true`, then npm will refuse to publish it. */
  private: boolean;
  /** A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default. */
  #publishConfig: Map<string, Primitive>;
  /** Array of file patterns that describes locations within the local file system that the install client should look up to find each workspace that needs to be symlinked to the top level node_modules folder */
  workspaces: Set<string>;

  constructor(data: JSONObject) {
    this.#data = data;
    this.#name = parse.string(validationMaps.name, true)(data.name) ?? '';
    this.#version = parse.string(validationMaps.version, true)(data.version) ?? '';
    this.private = !!data.private;

    Object.values(StringProps).forEach(name => (this[name] = parse.string()(data[name])));
    Object.values(StringListProps).forEach(name => (this[name] = parse.list(validationMaps.list(name))(data[name])));
    Object.values(StringMapProps).forEach(name => (this[name] = parse.map()(data[name])));
  }

  /** Name of the package */
  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = checkValue(value, validationMaps.name);
  }

  /** Package version, parseable by [`node-semver`](https://github.com/npm/node-semver). */
  get version(): string {
    return this.#version;
  }

  set version(value: string) {
    this.#version = checkValue(value, validationMaps.version);
  }
}

export default Parser;
