import semver from 'semver';

import Field from '../core/Field';
import { JSONValue } from '../types';

const OBJECT_FIELDS_NAMES = ['contributors', 'maintainers', 'funding'];

export interface IDependencyCompareResult {
  isPresented: boolean;
  isLower?: boolean;
  isGreater?: boolean;
}

export const replacer = (key: string, value: JSONValue): JSONValue => {
  if (value === null || ((typeof value === 'string' || Array.isArray(value)) && !value.length)) return undefined;
  if (value instanceof Set) return value.size ? [...value.values()].sort() : undefined;
  if (value instanceof Map) {
    if (!value.size) return undefined;
    if (OBJECT_FIELDS_NAMES.some(field => field === key)) return [...value.values()];

    return Object.fromEntries([...value.entries()].sort(([a], [b]) => a.localeCompare(b)));
  }
  if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return undefined;
    if (value instanceof Field) return value.getSnapshot();
  }

  return value;
};

export const compareDependencyFrom = (
  map: Map<string, string>,
  name: string,
  version: string
): IDependencyCompareResult => {
  let isPresented = false;
  let isLower;
  let isGreater;

  if (map) {
    const currentVersion = semver.coerce(map.get(name));

    if (currentVersion) {
      const requiredVersion = semver.coerce(version);

      isPresented = true;

      if (requiredVersion) {
        isLower = semver.lt(currentVersion, requiredVersion);
        isGreater = semver.gt(currentVersion, requiredVersion);
      }
    }
  }

  return { isPresented, isLower, isGreater };
};
