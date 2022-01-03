# Package

`package.json` helper

## Properties

- author: `Person | undefined` - Author of the package
- bin: `Map<string, string>` - The executable files that should be installed into the `PATH`
- browser: `string | undefined` - Client-side module ID that is the primary entry point
- bugs: `BugsLocation | undefined` - The URL to the package's issue tracker and/or the email address to which issues should be reported
- bundledDependencies: `Set<string>` - Package names that are bundled when the package is published
- config: `Map<string, string>` - Is used to set configuration parameters used in package scripts that persist across upgrades
- contributors: `Map<string, Person>` - A list of people who contributed to the package
- cpu: `Set<string>` - CPU architectures the module runs on
- dependencies: `Map<string, Dependency>` - The dependencies of the package
- description: `string | undefined` - Package description, listed in `npm search`
- devDependencies: `Map<string, Dependency>` - Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling
- directories: `Map<string, string>` - Indicates the structure of the package
- engines: `Map<string, string>` - Engines that this package runs on
- exports: `ExportMap | undefined` - Standard entry points of the package, with enhanced support for ECMAScript Modules
- files: `Set<string>` - The files included in the package
- funding: `Map<string, Funding>` - Describes and notifies consumers of a package's monetary support information
- imports: `ImportMap | undefined` - Import maps that only apply to import specifiers from within the package itself
- keywords: `Set<string>`- Keywords associated with package, listed in `npm search`
- license: `string | undefined` - The license for the package
- main: `string | undefined` - The module ID that is the primary entry point to the program
- maintainers: `Map<string, Person>` - A list of people who maintain the package
- man: `Set<string>` - Filenames to put in place for the `man` program to find
- optionalDependencies: `Map<string, Dependency>` - Dependencies that are skipped if they fail to install
- os: `Set<string>` - Operating systems the module runs on
- peerDependencies: `Map<string, Dependency>` - Dependencies that will usually be required by the package user directly or via another dependency
- peerDependenciesMeta: `Map<string, DependencyMeta>` - Indicate peer dependencies that are optional
- private: `boolean` - If set to `true`, then npm will refuse to publish it
- publishConfig: `Map<string, string | number | boolean>` - A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default
- repository: `Repository | undefined` - Location for the code repository
- scripts: `Map<string, string>` - Script commands that are run at various times in the lifecycle of the package. The key is the lifecycle event, and the value is the command to run at that point
- types: `string | undefined` - Point to bundled declaration file
- workspaces: `Set<string>` - Array of file patterns that describes locations within the local file system that the install client should look up to find each workspace that needs to be symlinked to the top level node_modules folder

## Accessors

- `get/set` name(): `string` - Name of the package
- `get/set` version(): `string` - Package version, parseable by [`node-semver`](https://github.com/npm/node-semver)
- `get/set` type(): `PackageType` - Resolution algorithm for importing ".js" files from the package's scope.
- `get/set` homepage(): `string | undefined` - The URL to the package's homepage
- `get` json(): `JSONObject` - Returns package.json structure
- `get` scope(): `string` - Package scope
- `get` nameWithoutScope(): `string` - Name of the package without scope

## Constructor

```typescript
constructor(value?: string | JSONObject, manager?: PackageManager): Package
```

| Name      | Type                   | Description                                                       |
| :-------- | :--------------------- | :---------------------------------------------------------------- |
| `value`   | _string \| JSONObject_ | `package.json` file path or `json`                                |
| `manager` | _enum_                 | package manager using in project, by default `PackageManager.NPM` |

## Methods

### toString

Returns package.json structure as string

### getMissingDependencies

Returns list of missing dependencies

#### Parameters

| Name   | Type                   | Description                                                                                                                       |
| :----- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `prop` | `DependenciesMapProps` | Value from enum, with dependencies field name, e.g. `dependencies \| devDependencies \| optionalDependencies \| peerDependencies` |
| `list` | `string[]`             | List with dependencies names                                                                                                      |

### getWrongVersionDependencies

Returns a list of dependencies with an incorrect version

#### Parameters

| Name   | Type                   | Description                                                                                                                       |
| :----- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| `prop` | `DependenciesMapProps` | Value from enum, with dependencies field name, e.g. `dependencies \| devDependencies \| optionalDependencies \| peerDependencies` |
| `map`  | `Map<string, string>`  | Map of dependencies with name and version to check                                                                                |

### install

Install dependencies

#### Parameters

| Name           | Type                               | Description                                          |
| :------------- | :--------------------------------- | :--------------------------------------------------- |
| `dependencies` | `Map<string, string \| undefined>` | Map of dependencies with name and version to install |
| `flags`        | `string[] \| undefined`            | List of flags, e.g. `--save-dev`                     |

### read

Read `package.json` file

### save

Write current package structure to file

#### Parameters

| Name       | Type                  | Description |
| :--------- | :-------------------- | :---------- |
| `filePath` | `string \| undefined` | File path   |
