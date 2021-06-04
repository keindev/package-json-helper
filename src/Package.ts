import fs from 'fs';
import path from 'path';
import semver, { SemVer } from 'semver';

import { IBugsLocation, IFunding, IPerson, JSONObject } from './types';
import utils from './utils';

export class Package {
  /** Name of the package */
  name: string;
  /** Package version, parseable by [`node-semver`](https://github.com/npm/node-semver). */
  version: string;
  /** Package description, listed in `npm search`. */
  description?: string;
  /** Keywords associated with package, listed in `npm search`. */
  keywords: Set<string>;
  /** The URL to the package's homepage. */
  homepage?: string;
  /** The URL to the package's issue tracker and/or the email address to which issues should be reported. */
  bugs?: IBugsLocation;
  /** The license for the package. */
  license?: string;
  /** Author of the package */
  author?: IPerson;
  /** A list of people who contributed to the package. */
  contributors: IPerson[];
  /** A list of people who maintain the package. */
  maintainers: IPerson[];
  /** Describes and notifies consumers of a package's monetary support information. */
  funding: IFunding[];
  /** The files included in the package. */
  files: Set<string>;

  constructor(value: string | JSONObject) {
    const data =
      typeof value === 'string' || typeof value === 'undefined'
        ? (JSON.parse(fs.readFileSync(value ?? path.resolve(process.cwd(), 'package.json'), 'utf-8')) as JSONObject)
        : value;

    this.name = utils.getName(data.name);
    this.version = utils.getVersion(data.version);
    this.description = utils.getString(data.description, { fieldName: 'Description' });
    this.keywords = utils.getStringSet(data.keywords, { fieldName: 'Keywords' });
    this.homepage = utils.getHomePage(data.homepage);
    this.bugs = utils.getBugsLocation(data.bugs);
    this.license = utils.getString(data.license, { fieldName: 'License' });
    this.author = utils.getPerson(data.author, 'Author');
    this.contributors = utils.getPersons(data.contributors, 'Contributors');
    this.maintainers = utils.getPersons(data.maintainers, 'Maintainers');
    this.funding = utils.getFunding(data.funding);
    this.files = utils.getStringSet(data.files, { fieldName: 'Files' });
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
