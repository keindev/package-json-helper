export type Maybe<T> = T | undefined;
export type Primitive = string | number | boolean | null;
export type JSONValue = undefined | Primitive | JSONObject | JSONValue[];
export type JSONObject = { [Key in string]?: JSONValue };

export enum Type {
  Module = 'module',
  Commonjs = 'commonjs',
}

export interface IBugsLocation {
  /** The URL to the package's issue tracker. */
  url: string;
  /** The email address to which issues should be reported. */
  email?: string;
}

export interface IPerson {
  name: string;
  email?: string;
  url?: string;
}

/** Describes and notifies consumers of a package's monetary support information. */
export interface IFunding {
  /** The type of funding. */
  type?: string;
  /** The URL to the funding page. */
  url: string;
}

export interface IDirectoryLocations {
  [key: string]: unknown;
  /** Location for executable scripts. Sugar to generate entries in the `bin` property by walking the folder. */
  bin?: string;
  /** Location for Markdown files. */
  doc?: string;
  /** Location for example scripts. */
  example?: string;
  /** Location for the bulk of the library. */
  lib?: string;
  /** Location for man pages. Sugar to generate a `man` array by walking the folder. */
  man?: string;
  /** Location for test files. */
  test?: string;
}

export interface IRepository {
  type?: string;
  url: string;
  /** Relative path to package.json if it is placed in non-root directory (for example if it is part of a monorepo). */
  directory?: string;
}
