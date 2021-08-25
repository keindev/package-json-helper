import fs from 'fs';
import path from 'path';

import PackageBase from './core/PackageBase';
import { JSONObject, Maybe } from './types';

export class Package extends PackageBase {
  constructor(value: string | JSONObject) {
    super(
      typeof value === 'string' || typeof value === 'undefined'
        ? (JSON.parse(fs.readFileSync(value ?? path.resolve(process.cwd(), 'package.json'), 'utf-8')) as JSONObject)
        : value
    );
  }

  get scope(): Maybe<string> {
    return this.name.match(/^@(?<scope>[\w.-]+)\/(?<name>[\w.-]+)/i)?.groups?.scope;
  }

  write(filePath?: string): void {
    fs.writeFileSync(filePath || path.resolve(process.cwd(), 'package.json'), this.toString());
  }
}

export default Package;
