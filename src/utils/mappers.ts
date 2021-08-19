import { DependencyMeta } from '../fields/DependencyMeta';
import { Funding } from '../fields/Funding';
import { Person } from '../fields/Person';
import { JSONValue } from '../types';
import { cast } from './parsers';

export const mappers = {
  toBin: (data: JSONValue): Map<string, string> =>
    new Map(
      Object.entries(typeof data === 'string' ? { '': data } : cast.toObject(data)).map(([key, value]) => [
        key,
        cast.toString(value),
      ])
    ),
  toPersons: (data: JSONValue): Map<string, Person> =>
    new Map(
      cast
        .toArray(data)
        .map(item => new Person(item))
        .map(person => [person.name, person])
    ),
  toFunding: (data: JSONValue): Map<string, Funding> =>
    new Map(
      (Array.isArray(data) ? data : [data].filter(Boolean))
        .map(item => new Funding(item))
        .map(funding => [funding.url, funding])
    ),
  toDependencyMeta: (data: JSONValue): Map<string, DependencyMeta> =>
    new Map(Object.entries(cast.toObject(data)).map(([key, meta]) => [key, new DependencyMeta(meta)])),
  toPublishConfig: (data: JSONValue): Map<string, string | number | boolean> =>
    new Map(
      Object.entries(cast.toObject(data)).map(([paramName, paramValue]) => [
        paramName,
        typeof paramValue === 'string' || typeof paramValue === 'number' || typeof paramValue === 'boolean'
          ? paramValue
          : '',
      ])
    ),
};
