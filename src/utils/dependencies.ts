import semver from 'semver';

import { Dependency } from '../fields/Dependency.js';
import { PackageChangeCompareResult, PackageDependency, PackageDependencyChangeType } from '../types.js';

const PackageChangeCompareMap = {
  [PackageChangeCompareResult.Less]: PackageDependencyChangeType.Downgraded,
  [PackageChangeCompareResult.More]: PackageDependencyChangeType.Bumped,
  [PackageChangeCompareResult.Equal]: PackageDependencyChangeType.Unchanged,
};

export const getVersion = (v?: string | Dependency): string | undefined => (typeof v === 'string' ? v : v?.version);
export const getRestrictionName = (name: string): string => (name[0] === '!' ? name.slice(1) : name);
export const getLink = (type: PackageDependency, name: string): string | undefined => {
  switch (type) {
    case PackageDependency.Engines:
      return undefined;
    default:
      return `https://www.npmjs.com/package/${name}`;
  }
};

export const getVersionChangeType = (left?: string, right?: string): PackageDependencyChangeType => {
  let type =
    typeof left === 'undefined' && typeof right === 'undefined'
      ? PackageDependencyChangeType.Unchanged
      : PackageDependencyChangeType.Changed;

  if (left && right) {
    const leftVersion = semver.coerce(left);
    const rightVersion = semver.coerce(right);

    if (leftVersion && rightVersion) type = PackageChangeCompareMap[semver.compare(leftVersion, rightVersion)];
  }

  return type;
};

export const getChangeType = (current?: string, previous?: string): PackageDependencyChangeType => {
  const currentComparators = current ? semver.toComparators(current) : [];
  const previousComparators = previous ? semver.toComparators(previous) : [];
  let type = PackageDependencyChangeType.Changed;

  switch (true) {
    case previousComparators.length === 0:
      type = PackageDependencyChangeType.Added;
      break;
    case currentComparators.length === previousComparators.length:
      if (currentComparators.length === 1) {
        const [leftCurrentComparator, rightCurrentComparator] = currentComparators.pop() ?? [];
        const [leftPreviousComparator, rightPreviousComparator] = previousComparators.pop() ?? [];
        const leftCompare = getVersionChangeType(leftCurrentComparator, leftPreviousComparator);
        const rightCompare = getVersionChangeType(rightCurrentComparator, rightPreviousComparator);

        type = leftCompare === rightCompare ? leftCompare : PackageDependencyChangeType.Changed;
      } else {
        const currentComparatorsList = currentComparators.flat();
        const previousComparatorsList = previousComparators.flat();

        type = currentComparatorsList.every(version => previousComparatorsList.includes(version))
          ? PackageDependencyChangeType.Unchanged
          : PackageDependencyChangeType.Changed;
      }
      break;
  }

  return type;
};
