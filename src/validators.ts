import semver from 'semver';

import { testEmail, testUrl } from './expressions';
import { JSONValue } from './types';

export type Validator<T> = (value: T) => true | string;
export type ValidatorCallback<T, K> = (value: T, ...props: K[]) => boolean;
export type ValidatorWrapper<T, K> = (error: string, ...props: K[]) => Validator<T>;

const validator = <T, K>(callback: ValidatorCallback<T, K>): ValidatorWrapper<T, K> => (
  error: string,
  ...props: K[]
) => (value: T) => {
  const result = callback(value, ...props);

  return result === true ? result : error;
};

export default {
  isString: validator((value?: string) => typeof value === 'string'),
  hasValidLength: validator(
    (value: string, { max = Number.MAX_VALUE, min = 0 }: { max: number; min: number }) =>
      value.length > min && value.length < max
  ),
  isSemVer: validator((value?: string) => !!value && semver.clean(value) !== null),
  isStringArray: validator(
    (list?: JSONValue[]) =>
      Array.isArray(list) && list.every(item => typeof item === 'string' || typeof item === 'number')
  ),
  isUrl: validator((value?: string) => !!value && testUrl(value)),
  isUrlOrUndefined: validator((value?: string) => !value || testUrl(value)),
  isEmail: validator((value?: string) => !!value && testEmail(value)),
  isEmailOrUndefined: validator((value?: string) => !value || testEmail(value)),
};
