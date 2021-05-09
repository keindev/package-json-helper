import fs from 'fs';
import path from 'path';
import semver, { SemVer } from 'semver';

import { IBugsLocation, IPackage, JSONObject } from './types';
import utils from './utils';

export class Package implements IPackage {
  name: string;
  version: string;
  description?: string;
  keywords: Set<string>;
  homepage?: string;
  bugs?: IBugsLocation;
  license?: string;

  constructor(value: string | JSONObject) {
    const data =
      typeof value === 'string' || typeof value === 'undefined'
        ? (JSON.parse(fs.readFileSync(value ?? path.resolve(process.cwd(), 'package.json'), 'utf-8')) as JSONObject)
        : value;

    this.name = utils.getName(data.name);
    this.version = utils.getVersion(data.version);
    this.description = utils.getString(data.description);
    this.keywords = new Set(utils.getKeywords(data.keywords));
    this.homepage = utils.getHomePage(data.homepage);
    this.bugs = utils.getBugsLocation(data.bugs);
    this.license = utils.getString(data.license);
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
