export type Maybe<T> = T | undefined;
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

/** Describes and notifies consumers of a package's monetary support information. */
export interface IFunding {
  /** The type of funding. */
  type?: string;
  /** The URL to the funding page. */
  url: string;
}
