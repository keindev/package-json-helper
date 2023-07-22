import semver from 'semver';

import { Dependency } from '../fields/Dependency.js';
import { CompareResult } from '../types/base.js';
import { ChangeType, Dependencies } from '../types/package.js';

const PackageChangeCompareMap = {
  [CompareResult.Less]: ChangeType.Downgraded,
  [CompareResult.More]: ChangeType.Bumped,
  [CompareResult.Equal]: ChangeType.Unchanged,
};

export const getVersion = (v?: string | Dependency): string | undefined => (typeof v === 'string' ? v : v?.version);
export const getRestrictionName = (name: string): string => (name[0] === '!' ? name.slice(1) : name);
export const getLink = (type: Dependencies, name: string): string | undefined => {
  switch (type) {
    case Dependencies.Engines:
      return undefined;
    default:
      return `https://www.npmjs.com/package/${name}`;
  }
};

export const getVersionChangeType = (left?: string, right?: string): ChangeType => {
  let type = left === undefined && right === undefined ? ChangeType.Unchanged : ChangeType.Changed;

  if (left && right) {
    const leftVersion = semver.coerce(left);
    const rightVersion = semver.coerce(right);

    if (leftVersion && rightVersion) type = PackageChangeCompareMap[semver.compare(leftVersion, rightVersion)];
  }

  return type;
};

export const getChangeType = (current?: string, previous?: string): ChangeType => {
  const currentComparators = current ? semver.toComparators(current) : [];
  const previousComparators = previous ? semver.toComparators(previous) : [];
  let type = ChangeType.Changed;

  switch (true) {
    case previousComparators.length === 0:
      type = ChangeType.Added;
      break;
    case currentComparators.length === previousComparators.length:
      if (currentComparators.length === 1) {
        const [leftCurrentComparator, rightCurrentComparator] = currentComparators.pop() ?? [];
        const [leftPreviousComparator, rightPreviousComparator] = previousComparators.pop() ?? [];
        const leftCompare = getVersionChangeType(leftCurrentComparator, leftPreviousComparator);
        const rightCompare = getVersionChangeType(rightCurrentComparator, rightPreviousComparator);

        type = leftCompare === rightCompare ? leftCompare : ChangeType.Changed;
      } else {
        const currentComparatorsList = currentComparators.flat();
        const previousComparatorsList = previousComparators.flat();

        type = currentComparatorsList.every(version => previousComparatorsList.includes(version))
          ? ChangeType.Unchanged
          : ChangeType.Changed;
      }
      break;
  }

  return type;
};
