import fs from 'fs';
import path from 'path';

import PackageBase from './core/PackageBase';
import { JSONObject } from './types';

const DEFAULT_FILE_PATH = path.resolve(process.cwd(), 'package.json');

export class Package extends PackageBase {
  #filePath?: string;

  constructor(value: string | JSONObject = DEFAULT_FILE_PATH) {
    super(typeof value === 'object' ? value : (JSON.parse(fs.readFileSync(value, 'utf-8')) as JSONObject));

    if (typeof value === 'string') this.#filePath = value;
  }

  get json(): JSONObject {
    return JSON.parse(this.toString());
  }

  save(filePath?: string): void {
    fs.writeFileSync(filePath ?? this.#filePath ?? DEFAULT_FILE_PATH, this.toString());
  }
}

export default Package;
