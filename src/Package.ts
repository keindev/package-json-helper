import { execa } from 'execa';
import { promises as fs } from 'fs';
import path from 'path';

import PackageBase from './core/PackageBase';
import { DependenciesMapProps, JSONObject, PackageInstallCommandMap, PackageManager } from './types';

const DEFAULT_FILE_PATH = path.resolve(process.cwd(), 'package.json');

export class Package extends PackageBase {
  #filePath = DEFAULT_FILE_PATH;
  #manager = PackageManager.NPM;

  constructor(value?: string | JSONObject, manager?: PackageManager) {
    super();

    if (typeof value === 'object') this.reset(value);
    if (typeof value === 'string') this.#filePath = value;
    if (manager) this.#manager = manager;
  }

  get json(): JSONObject {
    return JSON.parse(this.toString());
  }

  getMissingDependencies(prop: DependenciesMapProps, list: string[]): string[] {
    return list.filter(item => !this[prop].has(item));
  }

  getWrongVersionDependencies(prop: DependenciesMapProps, map: Map<string, string>): string[] {
    let dependency;

    return [...map.entries()].reduce((acc, [name, version]) => {
      if ((dependency = this[prop].get(name)) && !dependency.isSatisfy(version)) {
        acc.push(name);
      }

      return acc;
    }, [] as string[]);
  }

  async install(dependencies: Map<string, string | undefined>, flags?: string[]): Promise<void> {
    await this.save();
    await execa(
      this.#manager,
      [
        PackageInstallCommandMap[this.#manager],
        ...[...dependencies.entries()].map(([name, version]) => (version ? `${name}@"${version}"` : name)),
        ...(flags ?? []),
      ],
      {
        cwd: process.cwd(),
      }
    );
    await this.read();
  }

  async read(): Promise<void> {
    const data = await fs.readFile(this.#filePath ?? DEFAULT_FILE_PATH, 'utf-8');

    super.reset(JSON.parse(data));
  }

  async save(filePath?: string): Promise<void> {
    await fs.writeFile(filePath ?? this.#filePath, this.toString() + '\n');
  }
}

export default Package;
