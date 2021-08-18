import { JSONValue } from '../types';
import { check, EMAIL_REGEXP, IValidator, URL_REGEXP, validators } from './validators';

type IParser<T> = (value: JSONValue) => T;
type IParserWrapper<T> = (validators?: IValidator<T>[]) => IParser<T>;

const parser = <T>(fn: IParser<T>): IParserWrapper<T> => {
  const wrapper = (validationList?: IValidator<T>[]): IParser<T> => {
    const callback = (rawValue: JSONValue): T => (validationList ? check(fn(rawValue), validationList) : fn(rawValue));

    return callback;
  };

  return wrapper;
};

export const parsers = {
  getString: parser((v: JSONValue) => (typeof v === 'string' ? v : '')),
  getArray: parser((v: JSONValue) => (Array.isArray(v) ? v : [])),
  getObject: parser((v: JSONValue) => (typeof v === 'object' && !Array.isArray(v) && v !== null ? v : {})),
};

export const cast = {
  toString: parsers.getString(),
  toObject: parsers.getObject(),
  toUrl: parsers.getString([validators.isMatchesRegExp("Url can't contain any non-URL-safe characters", URL_REGEXP)]),
  toEmail: parsers.getString([validators.isMatchesRegExp('Email address is not valid', EMAIL_REGEXP)]),
};
