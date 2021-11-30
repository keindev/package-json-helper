import { Dependency } from './fields/Dependency';

export type Maybe<T> = T | undefined;
export type JSONValue = undefined | string | number | boolean | null | JSONObject | JSONValue[];
export type JSONObject = { [Key in string]?: JSONValue };

export enum PackageManager {
  NPM = 'npm',
  Yarn = 'yarn',
}

export enum PackageType {
  Module = 'module',
  Commonjs = 'commonjs',
}

export enum StringProps {
  Browser = 'browser',
  Description = 'description',
  License = 'license',
  Main = 'main',
  Types = 'types',
}

export enum StringListProps {
  BundledDependencies = 'bundledDependencies',
  CPU = 'cpu',
  Files = 'files',
  Keywords = 'keywords',
  Man = 'man',
  OS = 'os',
  Workspaces = 'workspaces',
}

export enum StringMapProps {
  Scripts = 'scripts',
  Config = 'config',
  Engines = 'engines',
  Directories = 'directories',
}

export enum DependenciesMapProps {
  Dependencies = 'dependencies',
  DevDependencies = 'devDependencies',
  OptionalDependencies = 'optionalDependencies',
  PeerDependencies = 'peerDependencies',
}

export type IStringProps = { [key in StringProps]?: string };
export type IStringListProps = { [key in StringListProps]?: Set<string> };
export type IStringMapProps = { [key in StringMapProps]?: Map<string, string> };
export type IDependenciesMapProps = { [key in DependenciesMapProps]?: Map<string, Dependency> };
export type IPackageProps = IStringProps & IStringListProps & IStringMapProps & IDependenciesMapProps;

export const PackageInstallCommandMap = {
  [PackageManager.NPM]: 'install',
  [PackageManager.Yarn]: 'add',
};

export const StringPropsMap = Object.values(StringProps);
export const StringListPropsMap = Object.values(StringListProps);
export const StringMapPropsMap = Object.values(StringMapProps);
export const DependenciesMapPropsMap = Object.values(DependenciesMapProps);
