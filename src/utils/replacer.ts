import Field from '../core/Field';
import { JSONValue } from '../types';

const OBJECT_FIELDS_NAMES = ['contributors', 'maintainers', 'funding'];

export const replacer = (key: string, value: JSONValue): JSONValue => {
  if (value === null || ((typeof value === 'string' || Array.isArray(value)) && !value.length)) return undefined;
  if (value instanceof Set) return value.size ? [...value.values()] : undefined;
  if (value instanceof Map) {
    if (!value.size) return undefined;
    if (OBJECT_FIELDS_NAMES.some(field => field === key)) return [...value.values()];

    return Object.fromEntries(value);
  }
  if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return undefined;
    if (value instanceof Field) return value.getSnapshot();
  }

  return value;
};
