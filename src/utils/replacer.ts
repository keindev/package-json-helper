import Field from '../core/Field';
import { JSONValue } from '../types';

export const replacer = (_: string, value: JSONValue): JSONValue => {
  if (value === null || ((typeof value === 'string' || Array.isArray(value)) && !value.length)) return undefined;
  if (value instanceof Map) return value.size ? Object.fromEntries(value) : undefined;
  if (value instanceof Set) return value.size ? [...value.values()] : undefined;
  if (typeof value === 'object') {
    if (Object.keys(value).length === 0) return undefined;
    if (value instanceof Field) return value.getSnapshot();
  }

  return value;
};

/*
FIXME: Map<K,V> - snapshot only values to V[]
TODO: add tests for specific cases
{
  "funding": {
    "http://example.com/donate": {
      "url": "http://example.com/donate",
      "type": "individual"
    },
    "http://example.com/donateAlso": "http://example.com/donateAlso",
    "https://www.patreon.com/my-account": {
      "url": "https://www.patreon.com/my-account",
      "type": "patreon"
    }
  },
  "bin": {
    "": "./index.js"
  }
}

*/
