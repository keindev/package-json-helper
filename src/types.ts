export type JSONValue = undefined | string | number | boolean | null | JSONObject | JSONValue[];
export type JSONObject = { [Key in string]?: JSONValue };

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

export interface IPackage {
  /** Name of the package */
  name: string;
  /** Package version, parseable by [`node-semver`](https://github.com/npm/node-semver). */
  version: string;
  /** Package description, listed in `npm search`. */
  description?: string;
  /** Keywords associated with package, listed in `npm search`. */
  keywords?: Set<string>;
  /** The URL to the package's homepage. */
  homepage?: string;
  /** The URL to the package's issue tracker and/or the email address to which issues should be reported. */
  bugs?: IBugsLocation;
  /** The license for the package. */
  license?: string;
  author?: IPerson;
  /** A list of people who contributed to the package. */
  contributors?: IPerson[];
  /** A list of people who maintain the package. */
  maintainers?: IPerson[];
}
