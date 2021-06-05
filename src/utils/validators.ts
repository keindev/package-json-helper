import semver from 'semver';

import { JSONObject, JSONValue, Maybe } from '../types';

export type IValidator<T> = (value: T) => true | string;
type IValidatorCallback<T, K> = (value: Maybe<T>, ...props: K[]) => boolean;
type IValidatorWrapper<T, K> = (error: string, ...props: K[]) => IValidator<Maybe<T>>;

const NAME_MAX_LENGTH = 214;
const STRING_MIN_LENGTH = 2;

const validator = <T, K>(fn: IValidatorCallback<T, K>): IValidatorWrapper<T, K> => {
  const wrapper = (error: string, ...props: K[]): IValidator<Maybe<T>> => {
    const callback = (value: Maybe<T>): true | string => fn(value, ...props) || error;

    return callback;
  };

  return wrapper;
};

const validate = {
  isMatchesRegExp: validator((value: Maybe<string>, expression: RegExp) => !!value && expression.test(value)),
  isString: validator((value: JSONValue) => typeof value === 'string'),
  isStringArray: validator((value: Maybe<JSONValue[]>) => !!value && value.every(item => typeof item === 'string')),
  isValidType: validator((value: JSONValue) => Object.values(Type).every(type => type === value)),
  hasValidLength: validator(
    (value: Maybe<string>, max?: number) =>
      !!value && value.length >= STRING_MIN_LENGTH && value.length <= (max ?? Number.MAX_VALUE)
  ),
  hasProperties: validator((value: Maybe<JSONObject>, properties: string[]) =>
    properties.every(name => Object.prototype.hasOwnProperty.call(value, name))
  ),
};

export const checkValue = <T>(value: T, validators: IValidator<Maybe<T>>[]): T => {
  let result;

  if (validators.some(isValid => (result = isValid(value)) !== true)) {
    throw new Error(result);
  }

  return value;
};

export const validationMaps = {
  name: [
    validate.isString('Name must be specified'),
    validate.hasValidLength('Name must be less than or equal to 214 characters', NAME_MAX_LENGTH),
  ],
  version: [
    validate.isString('Version must be specified'),
    validator((value?: string) => !!value && semver.clean(value) !== null)('Version must be parseable by node-semver'),
  ],
  list: (name: string): IValidator<Maybe<JSONValue[]>>[] => [
    validate.isStringArray(`${(name[0] ?? '').toUpperCase() + name.slice(1)} must be array of strings`),
  ],
  // TODO: проверка - isKeyValueObject для Map<string,string>
};
