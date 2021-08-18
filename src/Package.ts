import fs from 'fs';
import path from 'path';

import PackageBase from './PackageBase';
import { JSONObject } from './types';

export class Package extends PackageBase {
  constructor(value: string | JSONObject) {
    super(
      typeof value === 'string' || typeof value === 'undefined'
        ? (JSON.parse(fs.readFileSync(value ?? path.resolve(process.cwd(), 'package.json'), 'utf-8')) as JSONObject)
        : value
    );
  }

  get scope(): string | undefined {
    return this.name.match(/^@(?<scope>[\w.-]+)\/(?<name>[\w.-]+)/i)?.groups?.scope;
  }
}

export default Package;
