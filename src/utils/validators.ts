import semver from 'semver';

import { JSONObject, JSONValue } from '../types';

export type IValidator<T> = (value: T) => true | string;
type IValidatorCallback<T, K> = (value: T, ...props: K[]) => boolean;
type IValidatorWrapper<T, K> = (error: string, ...props: K[]) => IValidator<T>;

export const STRING_MIN_LENGTH = 2;
export const URL_REGEXP = /^(?:(git\+)?http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+$/;
export const EMAIL_REGEXP = /^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*$/i;

export const check = <T>(value: T, validators: IValidator<T>[]): T => {
  let result;

  if (validators.some(isValid => (result = isValid(value)) !== true)) {
    throw new Error(result);
  }

  return value;
};

const validator = <T, K>(fn: IValidatorCallback<T, K>): IValidatorWrapper<T, K> => {
  const wrapper = (error: string, ...props: K[]): IValidator<T> => {
    const callback = (value: T): true | string => fn(value, ...props) || error;

    return callback;
  };

  return wrapper;
};

const isString = (value: JSONValue): boolean => typeof value === 'string';

export const validators = {
  isStringArray: validator((value: JSONValue[]) => value.every(isString)),
  isSemanticVersion: validator((value: string) => semver.clean(value) !== null),
  isKeyValueObject: validator((value: JSONObject) => !!value && Object.values(value).every(isString)),
  isMatchesRegExp: validator((value: string, expression: RegExp) => expression.test(value)),
  isEnum: validator((value: string, variations: string[]) => variations.includes(value)),
  hasValidLength: validator(
    (value: string, max?: number) => value.length >= STRING_MIN_LENGTH && value.length <= (max ?? Number.MAX_VALUE)
  ),
  hasProperties: validator((value: JSONObject, properties: string[]) =>
    properties.every(name => Object.prototype.hasOwnProperty.call(value, name))
  ),
};

/*
const validate = {

  isValidType: validator((value: JSONValue) => Object.values(Type).every(type => type === value)),
  hasProperties: validator((value: Maybe<JSONObject>, properties: string[]) =>
    properties.every(name => Object.prototype.hasOwnProperty.call(value, name))
  ),
};
*/
