import { JSONValue } from './types';
import { Validator } from './validators';

type Parser<T> = (value: JSONValue) => T;
type ParserWrapper<T> = (validators?: Validator<T>[]) => Parser<T>;

const parse = <T>(parser: Parser<T>): ParserWrapper<T> => (validators?: Validator<T>[]) => (rawValue: JSONValue) => {
  const value = parser(rawValue);
  let result;

  if (value && validators && validators.some(isValid => (result = isValid(value)) !== true)) throw new Error(result);

  return value;
};

export default {
  parseString: parse((value: JSONValue) => (typeof value === 'string' ? value : '')),
  parseStringOrUndefined: parse((value: JSONValue) => (typeof value === 'string' ? value : undefined)),
  parseArrayOrUndefined: parse((value: JSONValue) => (Array.isArray(value) ? value : undefined)),
};
