import semver, { SemVer } from 'semver';

import { error, ErrorType } from './errors';
import { IBugsLocation, IPackage, JSONObject } from './types';
import { toArray, toBugsLocation, toKeywords, toPackageObject, toString, toUrl } from './utils';

export class Package implements IPackage {
  name: string;
  version: string;
  description: string;
  keywords: Set<string>;
  homepage: string;
  bugs?: IBugsLocation;
  license: string;

  constructor(value: string | JSONObject) {
    const data = toPackageObject(value);
    const rawVersion = semver.clean(toString(data.version));

    if (typeof data.name !== 'string' || !data.name.length) throw error(ErrorType.NameIsUndefined);
    if (!data.name.length) throw error(ErrorType.NameIsEmpty);
    if (!rawVersion) throw error(ErrorType.InvalidVersion);
    if (typeof data.license !== 'string' || !data.license.length) throw error(ErrorType.InvalidLicense);

    this.name = data.name;
    this.version = rawVersion;
    this.description = toString(data.description);
    this.keywords = new Set(toKeywords(toArray(data.keywords)));
    this.homepage = toUrl(data.homepage);
    this.bugs = toBugsLocation(data.bugs);
    this.license = data.license;
  }

  get prereleaseVersion(): string {
    return [...(semver.prerelease(this.version) ?? [])].join('.');
  }

  get semanticVersion(): SemVer {
    return semver.coerce(this.version) as SemVer;
  }

  get cleanVersion(): string {
    return this.semanticVersion.version;
  }

  get scope(): string | undefined {
    return this.name.match(/^@(?<scope>[\w.-]+)\/(?<name>[\w.-]+)/i)?.groups?.scope;
  }
}

export default Package;
