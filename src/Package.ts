import fs from 'fs';
import path from 'path';

import { BugsLocation } from './fields/Bugs';
import { Funding } from './fields/Funding';
import { Person } from './fields/Person';
import PackageBase from './PackageBase';
import { JSONObject, JSONValue } from './types';

const mapPersonsTo = (list: JSONValue, map: Map<string, Person>): void => {
  if (Array.isArray(list)) {
    list.forEach(item => {
      const person = new Person(item);

      if (person.name) {
        map.set(person.name, person);
      }
    });
  }
};

const mapFundingTo = (list: JSONValue, map: Map<string, Funding>): void => {
  if (Array.isArray(list)) {
    list.forEach(item => {
      const funding = new Funding(item);

      if (funding.url) {
        map.set(funding.url, funding);
      }
    });
  }
};

export class Package extends PackageBase {
  #contributors = new Map<string, Person>();
  #maintainers = new Map<string, Person>();
  #funding = new Map<string, Funding>();

  /** The URL to the package's issue tracker and/or the email address to which issues should be reported. */
  bugs: BugsLocation;
  /** Author of the package */
  author: Person;

  constructor(value: string | JSONObject) {
    const data =
      typeof value === 'string' || typeof value === 'undefined'
        ? (JSON.parse(fs.readFileSync(value ?? path.resolve(process.cwd(), 'package.json'), 'utf-8')) as JSONObject)
        : value;

    super(data);

    this.bugs = new BugsLocation(data.bugs);
    this.author = new Person(data.author);

    mapPersonsTo(data.contributors, this.contributors);
    mapPersonsTo(data.maintainers, this.maintainers);
    mapFundingTo(Array.isArray(data.funding) ? data.funding : [data.funding], this.funding);
  }

  get scope(): string | undefined {
    return this.name.match(/^@(?<scope>[\w.-]+)\/(?<name>[\w.-]+)/i)?.groups?.scope;
  }

  /** A list of people who contributed to the package. */
  get contributors(): Map<string, Person> {
    return this.#contributors;
  }

  /** A list of people who maintain the package. */
  get maintainers(): Map<string, Person> {
    return this.#maintainers;
  }

  /** Describes and notifies consumers of a package's monetary support information. */
  get funding(): Map<string, Funding> {
    return this.#funding;
  }
}

export default Package;

/** Indicates the structure of the package. */
// #directories?: IDirectoryLocations;
// this.directories = utils.getDirectories(data.directories);

/** Location for the code repository. */
// #repository?: IRepository;
// this.repository = utils.getRepository(data.repository);

/** Indicate peer dependencies that are optional. */
// #peerDependenciesMeta: Map<string, boolean>;
// this.peerDependenciesMeta = utils.getPeerDependenciesMeta(data.peerDependenciesMeta);

/** A set of config values that will be used at publish-time. It's especially handy to set the tag, registry or access, to ensure that a given package is not tagged with 'latest', published to the global public registry or that a scoped module is private by default. */
// #publishConfig: Map<string, Primitive>;
// this.publishConfig = utils.getPublishConfig(data.publishConfig);
