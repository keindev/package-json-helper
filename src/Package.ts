import fs from 'fs';
import path from 'path';

import PackageBase from './core/PackageBase';
import { JSONObject } from './types';

export class Package extends PackageBase {
  constructor(value: string | JSONObject) {
    super(
      typeof value === 'string' || typeof value === 'undefined'
        ? (JSON.parse(fs.readFileSync(value ?? path.resolve(process.cwd(), 'package.json'), 'utf-8')) as JSONObject)
        : value
    );
  }

  write(filePath?: string): void {
    fs.writeFileSync(filePath || path.resolve(process.cwd(), 'package.json'), this.toString());
  }
}

export default Package;
