import { execa } from 'execa';
import { promises as fs } from 'fs';
import path from 'path';

import PackageBase from './core/PackageBase';
import {
    DependenciesMapProps, IPackageChange, JSONObject, PackageChangeCompareResult, PackageDependency,
    PackageDependencyChangeType, PackageInstallCommandMap, PackageManager, PackageRestriction,
} from './types';
import { getChangeType, getLink, getRestrictionName, getVersion } from './utils/dependencies';

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

  getChanges(property: PackageDependency | PackageRestriction, pkg: Package): IPackageChange[] {
    switch (property) {
      case PackageDependency.Dependencies:
      case PackageDependency.DevDependencies:
      case PackageDependency.Engines:
      case PackageDependency.OptionalDependencies:
      case PackageDependency.PeerDependencies:
        return this.getDependenciesChanges(property, pkg);
      case PackageRestriction.BundledDependencies:
      case PackageRestriction.CPU:
      case PackageRestriction.OS:
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

  private getDependenciesChanges(property: PackageDependency, pkg: Package): IPackageChange[] {
    const changes: IPackageChange[] = [];
    const currDeps = this[property];
    const prevDeps = pkg[property];

    currDeps.forEach((value, name) => {
      const current = getVersion(value);
      const link = getLink(property, name);
      let previous;
      let type = PackageDependencyChangeType.Added;

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
        type: PackageDependencyChangeType.Removed,
        link: getLink(property, name),
        value: { previous: getVersion(previous) },
      });
    });

    return [...changes.values()].filter(change => change.type !== PackageDependencyChangeType.Unchanged);
  }

  private getRestrictionsChanges(property: PackageRestriction, pkg: Package): IPackageChange[] {
    const changes: IPackageChange[] = [];
    const restrictions = [...pkg[property].values()];
    const compareMap = {
      [PackageChangeCompareResult.Less]: PackageDependencyChangeType.Changed,
      [PackageChangeCompareResult.More]: PackageDependencyChangeType.Changed,
      [PackageChangeCompareResult.Equal]: PackageDependencyChangeType.Unchanged,
    };

    changes.push(
      ...[...this[property].values()].map(current => {
        const index = restrictions.indexOf(current);
        const previous = restrictions[index];
        const type = previous
          ? compareMap[current.localeCompare(previous) as PackageChangeCompareResult]
          : PackageDependencyChangeType.Added;

        if (previous) restrictions.splice(index, 1);

        return { name: getRestrictionName(current), value: { current, previous }, type };
      }),
      ...restrictions.map(previous => ({
        name: getRestrictionName(previous),
        type: PackageDependencyChangeType.Removed,
        value: { previous },
      }))
    );

    return [...changes.values()].filter(change => change.type !== PackageDependencyChangeType.Unchanged);
  }
}

export default Package;
