import fs from 'fs';
import path from 'path';
import semver, { SemVer } from 'semver';

import Parser from './Parser';
import { JSONObject, Type } from './types';
import utils from './utils';

export class Package extends Parser {
  constructor(value: string | JSONObject) {
    super(
      typeof value === 'string' || typeof value === 'undefined'
        ? (JSON.parse(fs.readFileSync(value ?? path.resolve(process.cwd(), 'package.json'), 'utf-8')) as JSONObject)
        : value
    );

    this.homepage = utils.getHomePage(data.homepage);
    this.bugs = utils.getBugsLocation(data.bugs);

    this.author = utils.getPerson(data.author, 'Author');
    this.contributors = utils.getPersons(data.contributors, 'Contributors');
    this.maintainers = utils.getPersons(data.maintainers, 'Maintainers');
    this.funding = utils.getFunding(data.funding);

    this.type = utils.getType(data.type) ?? Type.Commonjs;

    this.bin = utils.getBin(data.bin, this.name);
    this.man = utils.getMan(data.man);
    this.directories = utils.getDirectories(data.directories);
    this.repository = utils.getRepository(data.repository);

    this.peerDependenciesMeta = utils.getPeerDependenciesMeta(data.peerDependenciesMeta);

    this.publishConfig = utils.getPublishConfig(data.publishConfig);
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
