import { JSONValue, Maybe } from '../types';
import { checkValue, IValidator } from './validators';

type IParser<T> = (value: JSONValue) => T;
type IParserWrapper<T> = (validators?: IValidator<Maybe<T>>[], strict?: boolean) => IParser<T>;

const parser = <T>(fn: IParser<T>): IParserWrapper<T> => {
  const wrapper = (validators?: IValidator<Maybe<T>>[], strict?: boolean): IParser<T> => {
    const callback = (rawValue: JSONValue): T => {
      const value: Maybe<T> = fn(rawValue);

      return validators && (strict || (!strict && typeof value !== 'undefined'))
        ? checkValue(value, validators)
        : value;
    };

    return callback;
  };

  return wrapper;
};

export const parse = {
  string: parser((v: JSONValue) => (typeof v === 'string' ? v : undefined)),
  object: parser((v: JSONValue) => (typeof v === 'object' && !Array.isArray(v) && v !== null ? v : undefined)),
  array: parser((v: JSONValue) => (Array.isArray(v) ? v : undefined)),
  list: parser((v: JSONValue) => new Set<string>((parse.array()(v) ?? []) as string[])),
  map: parser(
    (v: JSONValue) =>
      new Map(Object.entries(parse.object(v) ?? {}).map(([key, value]) => [key, parse.string(value) ?? '']))
  ),
};
