export enum ManagerType {
  NPM = 'npm',
  Yarn = 'yarn',
}

export enum PackageType {
  Module = 'module',
  Commonjs = 'commonjs',
}

export enum Dependencies {
  // https://docs.npmjs.com/files/package.json#engines
  Engines = 'engines',
  // https://docs.npmjs.com/files/package.json#dependencies
  Dependencies = 'dependencies',
  // https://docs.npmjs.com/files/package.json#devdependencies
  DevDependencies = 'devDependencies',
  // https://docs.npmjs.com/files/package.json#peerdependencies
  PeerDependencies = 'peerDependencies',
  // https://docs.npmjs.com/files/package.json#optionaldependencies
  OptionalDependencies = 'optionalDependencies',
}

export enum Restriction {
  // https://docs.npmjs.com/files/package.json#bundleddependencies
  BundledDependencies = 'bundledDependencies',
  // https://docs.npmjs.com/files/package.json#os
  OS = 'os',
  // https://docs.npmjs.com/files/package.json#cpu
  CPU = 'cpu',
}

export enum ChangeType {
  Added = 'added',
  Bumped = 'bumped',
  Changed = 'changed',
  Downgraded = 'downgraded',
  Removed = 'removed',
  Unchanged = 'unchanged',
}

export interface IChange {
  link?: string;
  name: string;
  type: ChangeType;
  value: {
    current?: string;
    previous?: string;
  };
}
