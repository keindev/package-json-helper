import semver from 'semver';

import { JSONObject } from '../types';

export type IValidator<T> = (value: T) => true | string;
type IValidatorCallback<T, K> = (value: T, ...props: K[]) => boolean;
type IValidatorWrapper<T, K> = (error: string, ...props: K[]) => IValidator<T>;

export const URL_REGEXP = /^[\w.-]+(?:\.[\w.-]+)?[\w!#$&'()*+,./:;=?@[\]~-]+$/;
export const EMAIL_REGEXP = /^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*$/i;

export const check = <T>(value: T, validators: IValidator<T>[]): T => {
  let result;

  if (validators.some(fn => (result = fn(value)) !== true)) {
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

export const validators = {
  isSemanticVersion: validator((value: string) => semver.clean(value) !== null),
  isMatchesRegExp: validator((value: string, expression: RegExp) => expression.test(value)),
  isEnum: validator((value: string, variations: string[]) => variations.includes(value)),
  hasValidLength: validator((value: string, max?: number) => value.length <= (max ?? Number.MAX_VALUE)),
  hasProperties: validator((value: JSONObject, properties: string[]) =>
    properties.every(name => Object.prototype.hasOwnProperty.call(value, name))
  ),
};
