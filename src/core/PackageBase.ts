import { BugsLocation } from '../fields/Bugs';
import { Dependency } from '../fields/Dependency';
import { DependencyMeta } from '../fields/DependencyMeta';
import { ExportMap } from '../fields/ExportMap';
import Field from '../fields/Field';
import { Funding } from '../fields/Funding';
import { ImportMap } from '../fields/ImportMap';
import { Person } from '../fields/Person';
import { Repository } from '../fields/Repository';
import {
    DependenciesMapPropsMap, IPackageProps, JSONObject, JSONValue, StringListPropsMap, StringMapPropsMap,
    StringPropsMap,
} from '../types';
import { cast } from '../utils/parsers';
import AbstractPackage from './AbstractPackage';

const TAB_WIDTH = 2;

class PackageBase extends AbstractPackage implements IPackageProps {
  /** Author of the package */
  author?: Person;
  /** The executable files that should be installed into the `PATH`. */
  readonly bin: Map<string, string>;
  /** Client-side module ID that is the primary entry point. */
  browser?: string;
  /** The URL to the package's issue tracker and/or the email address to which issues should be reported. */
  bugs?: BugsLocation;
  /** Package names that are bundled when the package is published. */
  readonly bundledDependencies = new Set<string>();
  /** Is used to set configuration parameters used in package scripts that persist across upgrades. */
  readonly config = new Map<string, string>();
  /** A list of people who contributed to the package. */
  readonly contributors: Map<string, Person>;
  /** CPU architectures the module runs on. */
  readonly cpu = new Set<string>();
  /** The dependencies of the package. */
  readonly dependencies = new Map<string, Dependency>();
  /** Package description, listed in `npm search`. */
  description?: string;
  /** Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling. */
  readonly devDependencies = new Map<string, Dependency>();
  /** Indicates the structure of the package. */
  readonly directories = new Map<string, string>();
  /** Engines that this package runs on. */
  readonly engines = new Map<string, string>();
  /** Standard entry points of the package, with enhanced support for ECMAScript Modules. */
  readonly exports: ExportMap;
  /** The files included in the package. */
  readonly files = new Set<string>();
  /** Describes and notifies consumers of a package's monetary support information. */
  readonly funding: Map<string, Funding>;
  /** Import maps that only apply to import specifiers from within the package itself */
  readonly imports: ImportMap;
  /** Keywords associated with package, listed in `npm search`. */
  readonly keywords = new Set<string>();
  /** The license for the package. */
  license?: string;
  /** The module ID that is the primary entry point to the program. */
  main?: string;
  /** A list of people who maintain the package. */
  readonly maintainers: Map<string, Person>;
  /** Filenames to put in place for the `man` program to find. */
  readonly man = new Set<string>();
  /** Dependencies that are skipped if they fail to install. */
  readonly optionalDependencies = new Map<string, Dependency>();
  /** Operating systems the module runs on. */
  readonly os = new Set<string>();
  /** Dependencies that will usually be required by the package user directly or via another dependency. */
  readonly peerDependencies = new Map<string, Dependency>();
  /** Indicate peer dependencies that are optional. */
  readonly peerDependenciesMeta: Map<string, DependencyMeta>;
  /** If set to `true`, then npm will refuse to publish it. */
  private: boolean;
  /** A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default. */
  readonly publishConfig: Map<string, string | number | boolean>;
  /** Location for the code repository. */
  repository?: Repository;
  /** Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point. */
  readonly scripts = new Map<string, string>();
  /** Point to bundled declaration file. */
  types?: string;
  /** Array of file patterns that describes locations within the local file system that the install client should look up to find each workspace that needs to be symlinked to the top level node_modules folder */
  readonly workspaces = new Set<string>();

  constructor(data: JSONObject) {
    super(data);

    this.private = !!data.private;
    this.bugs = cast.toBugsLocation(data.bugs);
    this.author = cast.toPerson(data.author);
    this.repository = cast.toRepository(data.repository);
    this.bin = cast.toBin(this.nameWithoutScope, data.bin);
    this.contributors = cast.toPersons(data.contributors);
    this.maintainers = cast.toPersons(data.maintainers);
    this.funding = cast.toFundingList(data.funding);
    this.peerDependenciesMeta = cast.toDependencyMeta(data.peerDependenciesMeta);
    this.publishConfig = cast.toPublishConfig(data.publishConfig);
    this.exports = cast.toExportsMap(data.exports);
    this.imports = cast.toImportsMap(data.imports);

    StringPropsMap.forEach(name => (this[name] = cast.toString(data[name])));
    StringListPropsMap.forEach(name => cast.toSet(data[name], this[name]));
    StringMapPropsMap.forEach(name => cast.toStringMap(data[name], this[name]));
    DependenciesMapPropsMap.forEach(name => cast.toDependencyMap(data[name], this[name]));
  }

  // eslint-disable-next-line max-lines-per-function
  toString(): string {
    const OBJECT_FIELDS_NAMES = ['contributors', 'maintainers', 'funding'];

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
        main: this.exports.map.size ? undefined : this.main,
        imports: this.imports,
        exports: this.exports,
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
      (key: string, value: JSONValue): JSONValue => {
        if (value === null || ((typeof value === 'string' || Array.isArray(value)) && !value.length)) return undefined;
        if (value instanceof Set) return value.size ? [...value.values()].sort() : undefined;
        if (value instanceof Map) {
          if (!value.size) return undefined;
          if (OBJECT_FIELDS_NAMES.some(field => field === key)) return [...value.values()];

          return Object.fromEntries([...value.entries()].sort(([a], [b]) => a.localeCompare(b)));
        }
        if (typeof value === 'object') {
          if (Object.keys(value).length === 0) return undefined;
          if (value instanceof Field) return value.getSnapshot();
        }

        return value;
      },
      TAB_WIDTH
    );
  }
}

export default PackageBase;
