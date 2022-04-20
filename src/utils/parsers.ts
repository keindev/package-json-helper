import { BugsLocation } from '../fields/Bugs.js';
import { Dependency } from '../fields/Dependency.js';
import { DependencyMeta } from '../fields/DependencyMeta.js';
import { ExportMap } from '../fields/ExportMap.js';
import { Funding } from '../fields/Funding.js';
import { ImportMap } from '../fields/ImportMap.js';
import { Person } from '../fields/Person.js';
import { Repository } from '../fields/Repository.js';
import { JSONObject, JSONValue, Maybe } from '../types.js';
import { check, EMAIL_REGEXP, IValidator, URL_REGEXP, validators } from './validators.js';

const PERSON_REGEXP =
  /^(?<name>^[ 1-9_a-z-]+)(?<emailWrapper> <(?<email>[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*)>)?(?<urlWrapper> \((?<url>(?:\w+?:\/\/)?[\w\\-]+(?:\.[\w-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+)\))?$/i;

type IParser<T> = (value: JSONValue) => Maybe<T>;
type IParserWrapper<T> = (validators?: IValidator<NonNullable<T>>[]) => IParser<Maybe<T>>;

const parser = <T>(fn: IParser<T>): IParserWrapper<T> => {
  const wrapper = (validationList?: IValidator<NonNullable<T>>[]): IParser<Maybe<T>> => {
    const callback = (rawValue: JSONValue): Maybe<T> => {
      const value = fn(rawValue);

      return validationList && typeof value !== 'undefined' && value !== null
        ? check(value as NonNullable<T>, validationList)
        : value;
    };

    return callback;
  };

  return wrapper;
};

export const parsers = {
  getString: parser((v: JSONValue) => (typeof v === 'string' ? v : undefined)),
  getArray: parser((v: JSONValue) => (Array.isArray(v) ? v : [])),
  getObject: parser((v: JSONValue) => (typeof v === 'object' && !Array.isArray(v) && v !== null ? v : {})),
};

export const cast = {
  toString: parsers.getString(),
  toObject: parsers.getObject(),
  toArray: parsers.getArray(),
  toUrl: parsers.getString([validators.isMatchesRegExp("Url can't contain any non-URL-safe characters", URL_REGEXP)]),
  toEmail: parsers.getString([validators.isMatchesRegExp('Email address is not valid', EMAIL_REGEXP)]),
  toMap: <T>(data: JSONValue, map: Map<string, T>, callback: (key: string, rawValue: JSONValue) => T): void => {
    const obj = cast.toObject(data);

    if (obj) {
      Object.entries(obj).forEach(([key, rawValue]) => {
        const value = callback(key, rawValue);

        if (value) map.set(key, value);
      });
    }
  },
  toSet: (data: JSONValue, list: Set<string>): void => {
    const values = typeof data === 'string' ? [data] : cast.toArray(data);

    if (values) {
      values.forEach(rawValue => {
        const value = cast.toString(rawValue);

        if (value) list.add(value);
      });
    }
  },
  toStringMap: (data: JSONValue, map: Map<string, string>): void => {
    cast.toMap(data, map, (_, rawValue) => cast.toString(rawValue));
  },
  toDependencyMap: (data: JSONValue, map: Map<string, Dependency>): void => {
    cast.toMap(data, map, (key, rawValue) => {
      const value = cast.toString(rawValue);

      return value ? new Dependency(key, value) : undefined;
    });
  },
  toLink: (data: JSONValue): JSONObject & { url?: string } => {
    const { url, ...others } =
      typeof data === 'string'
        ? { url: data }
        : parsers.getObject([validators.hasProperties('Url is required field', ['url'])])(data) ?? {};

    return { url: cast.toUrl(url), ...others };
  },
  toBugsLocation: (data: JSONValue): Maybe<BugsLocation> => {
    if (!data) return undefined;

    const { url, email } = cast.toLink(data);

    return url ? new BugsLocation({ url, email: cast.toString(email) }) : undefined;
  },
  toRepository: (data: JSONValue): Maybe<Repository> => {
    if (!data) return undefined;

    const { url, type, directory } = cast.toLink(data);

    return url ? new Repository({ url, type: cast.toString(type), directory: cast.toString(directory) }) : undefined;
  },
  toDependencyMeta: (data: JSONValue): Map<string, DependencyMeta> => {
    const meta = cast.toObject(data);
    const map = new Map();

    if (meta) {
      Object.entries(meta).forEach(([name, value]) => {
        const options = parsers.getObject([
          validators.hasProperties('Optional is required field of dependency meta', ['optional']),
        ])(value);

        if (options) {
          map.set(name, new DependencyMeta({ name, optional: !!options?.optional }));
        }
      });
    }

    return map;
  },
  toBin: (packageName: string, data: JSONValue): Map<string, string> => {
    const map = new Map();

    if (typeof data === 'string') {
      map.set(packageName, data);
    } else {
      const paths = cast.toObject(data);

      if (paths) {
        Object.entries(paths).forEach(([name, value]) => {
          if (typeof value === 'string') map.set(name, value);
        });
      }
    }

    return map;
  },
  toPerson: (data: JSONValue): Maybe<Person> => {
    let result;

    if (data) {
      const person = parsers.getObject([validators.hasProperties('Person name is required field', ['name'])])(
        typeof data === 'string' ? data.match(PERSON_REGEXP)?.groups ?? {} : data
      );

      if (person) {
        const name = cast.toString(person.name);

        if (name) {
          const url = cast.toString(person.url);
          const email = cast.toString(person.email);

          result = new Person({ name, url: url && cast.toUrl(url), email: email && cast.toEmail(email) });
        }
      }
    }

    return result;
  },
  toPersons: (data: JSONValue): Map<string, Person> => {
    const map = new Map();
    const persons = cast.toArray(data);

    if (persons) {
      persons.forEach(value => {
        const person = cast.toPerson(value);

        if (person) map.set(person.name, person);
      });
    }

    return map;
  },
  toFundingList: (data: JSONValue): Map<string, Funding> => {
    const map = new Map();
    const append = (value: JSONValue): void => {
      let funding;

      if (typeof value === 'string') {
        const url = cast.toUrl(value);

        if (url) funding = new Funding({ url });
      } else {
        const { url, type } = cast.toLink(value);

        if (url) funding = new Funding({ url, type: cast.toString(type) });
      }

      if (funding) map.set(funding.url, funding);
    };

    if (Array.isArray(data)) data.forEach(append);
    else if (typeof data === 'object' || typeof data === 'string') append(data);

    return map;
  },
  toPublishConfig: (data: JSONValue): Map<string, string | number | boolean> => {
    const map = new Map();
    const config = cast.toObject(data);

    if (config) {
      Object.entries(config).forEach(([name, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') map.set(name, value);
      });
    }

    return map;
  },
  toExportsMap: (data: JSONValue): ExportMap => {
    const map = new Map<string, string | ExportMap | null>();

    if (typeof data === 'string' || data === null) {
      map.set('.', data ?? null);
    } else {
      const exportMap = cast.toObject(data);

      if (exportMap) {
        Object.entries(exportMap).forEach(([key, value]) => {
          map.set(
            key,
            typeof value === 'string' || typeof value === 'undefined' || value === null
              ? value ?? null
              : cast.toExportsMap(value)
          );
        });
      }
    }

    return new ExportMap({ map });
  },
  toImportsMap: (data: JSONValue): ImportMap => {
    const map = new Map<string, string | ImportMap>();

    if (typeof data === 'string') {
      map.set('.', data);
    } else {
      const exportMap = cast.toObject(data);

      if (exportMap) {
        Object.entries(exportMap).forEach(([key, value]) => {
          map.set(key, typeof value === 'string' ? value : cast.toImportsMap(value));
        });
      }
    }

    return new ImportMap({ map });
  },
};
