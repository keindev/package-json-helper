import { execa } from 'execa';
import { promises as fs } from 'fs';
import path from 'path';
import semver from 'semver';

import PackageBase from './core/PackageBase.js';
import { CompareResult, JSONObject } from './types/base.js';
import { ChangeType, Dependencies, IChange, ManagerType, Restriction } from './types/package.js';
import { DependenciesMapProps } from './types/properties.js';
import { getChangeType, getLink, getRestrictionName, getVersion } from './utils/dependencies.js';

const DEFAULT_FILE_PATH = path.resolve(process.cwd(), 'package.json');

const PackageInstallCommandMap = {
  [ManagerType.NPM]: 'install',
  [ManagerType.Yarn]: 'add',
};

export class Package extends PackageBase {
  #filePath = DEFAULT_FILE_PATH;
  #manager = ManagerType.NPM;

  constructor(value?: string | JSONObject, manager?: ManagerType) {
    super();

    if (typeof value === 'object') this.reset(value);
    if (typeof value === 'string') this.#filePath = value;
    if (manager) this.#manager = manager;
  }

  get json(): JSONObject {
    return JSON.parse(this.toString());
  }

  bump({ major, minor, patch }: { major?: number; minor?: number; patch?: number }): void {
    if (this.version) {
      let nextVersion: string | null | undefined;

      if (major) nextVersion = semver.inc(this.version, 'major');
      if (!major && minor) nextVersion = semver.inc(this.version, 'minor');
      if (!major && !minor && patch) nextVersion = semver.inc(this.version, 'patch');
      if (nextVersion) this.version = semver.coerce(nextVersion)?.version;
    }
  }

  getChanges(property: Dependencies | Restriction, pkg: Package): IChange[] {
    switch (property) {
      case Dependencies.Dependencies:
      case Dependencies.DevDependencies:
      case Dependencies.Engines:
      case Dependencies.OptionalDependencies:
      case Dependencies.PeerDependencies:
        return this.getDependenciesChanges(property, pkg);
      case Restriction.BundledDependencies:
      case Restriction.CPU:
      case Restriction.OS:
        return this.getRestrictionsChanges(property, pkg);
      default:
        return [];
    }
  }

  getMissingDependencies(property: DependenciesMapProps, list: string[]): string[] {
    return list.filter(item => !this[property].has(item));
  }

  getWrongVersionDependencies(property: DependenciesMapProps, map: Map<string, string>): string[] {
    let dependency;

    return [...map.entries()].reduce((acc, [name, version]) => {
      if ((dependency = this[property].get(name)) && !dependency.isSatisfy(version)) {
        acc.push(name);
      }

      return acc;
    }, [] as string[]);
  }

  async install(dependencies: Map<string, string | undefined>, flags?: string[]): Promise<void> {
    await execa(
      this.#manager,
      [
        PackageInstallCommandMap[this.#manager],
        ...[...dependencies.entries()].map(([name, version]) => (version ? `${name}@${version}` : name)),
        ...(flags ?? []),
      ],
      {
        cwd: process.cwd(),
      }
    );
  }

  async read(): Promise<void> {
    const data = await fs.readFile(this.#filePath ?? DEFAULT_FILE_PATH, 'utf-8');

    super.reset(JSON.parse(data));
  }

  async save(filePath?: string): Promise<void> {
    await fs.writeFile(filePath ?? this.#filePath, this.toString() + '\n');
  }

  private getDependenciesChanges(property: Dependencies, pkg: Package): IChange[] {
    const changes: IChange[] = [];
    const currDeps = this[property];
    const prevDeps = pkg[property];

    currDeps.forEach((value, name) => {
      const current = getVersion(value);
      const link = getLink(property, name);
      let previous;
      let type = ChangeType.Added;

      if (prevDeps.has(name)) {
        previous = getVersion(prevDeps.get(name));
        type = getChangeType(current, previous);
        prevDeps.delete(name);
      }

      changes.push({ name, value: { current, previous }, type, link });
    });

    prevDeps.forEach((previous, name) => {
      changes.push({
        name,
        type: ChangeType.Removed,
        link: getLink(property, name),
        value: { previous: getVersion(previous) },
      });
    });

    return [...changes.values()].filter(change => change.type !== ChangeType.Unchanged);
  }

  private getRestrictionsChanges(property: Restriction, pkg: Package): IChange[] {
    const changes: IChange[] = [];
    const restrictions = [...pkg[property].values()];
    const compareMap = {
      [CompareResult.Less]: ChangeType.Changed,
      [CompareResult.More]: ChangeType.Changed,
      [CompareResult.Equal]: ChangeType.Unchanged,
    };

    changes.push(
      ...[...this[property].values()].map(current => {
        const index = restrictions.indexOf(current);
        const previous = restrictions[index];
        const type = previous ? compareMap[current.localeCompare(previous) as CompareResult] : ChangeType.Added;

        if (previous) restrictions.splice(index, 1);

        return { name: getRestrictionName(current), value: { current, previous }, type };
      }),
      ...restrictions.map(previous => ({
        name: getRestrictionName(previous),
        type: ChangeType.Removed,
        value: { previous },
      }))
    );

    return [...changes.values()].filter(change => change.type !== ChangeType.Unchanged);
  }
}

export default Package;
