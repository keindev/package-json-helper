import semver from 'semver';

import { IBugsLocation, IFunding, IPerson, JSONObject, JSONValue, Maybe } from './types';

type Validator<T> = (value: T) => true | string;
type ValidatorCallback<T, K> = (value: Maybe<T>, ...props: K[]) => boolean;
type ValidatorWrapper<T, K> = (error: string, ...props: K[]) => Validator<Maybe<T>>;

type Parser<T> = (value: JSONValue) => T;
type ParserWrapperParams = { strict?: boolean; fieldName?: string };
type ParserWrapper<T> = (validators?: Validator<Maybe<T>>[], params?: ParserWrapperParams) => Parser<T>;

const NAME_MAX_LENGTH = 214;
const STRING_MIN_LENGTH = 2;
const URL_REGEXP = /^(?:(git\+)?http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+$/;
const EMAIL_REGEXP = /^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*$/i;
const PERSON_REGEXP =
  /^(?<name>^[ 1-9_a-z-]+)(?<emailWrapper> <(?<email>[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*)>)?(?<urlWrapper> \((?<url>(?:(git\+)?http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+)\))?$/i;

const parser = <T>(callback: Parser<T>): ParserWrapper<T> => {
  const wrapper = (validators?: Validator<Maybe<T>>[], params?: ParserWrapperParams): Parser<T> => {
    const parserCallback = (rawValue: JSONValue): T => {
      const value: Maybe<T> = callback(rawValue);
      let result;

      if (
        validators &&
        (params?.strict || (!params?.strict && typeof value !== 'undefined')) &&
        validators.some(isValid => (result = isValid(value)) !== true)
      ) {
        throw new Error(params?.fieldName ? `${params.fieldName} - ${result}` : result);
      }

      return value;
    };

    return parserCallback;
  };

  return wrapper;
};

const validator = <T, K>(callback: ValidatorCallback<T, K>): ValidatorWrapper<T, K> => {
  const wrapper = (error: string, ...props: K[]): Validator<Maybe<T>> => {
    const validationCallback = (value: Maybe<T>): true | string => callback(value, ...props) || error;

    return validationCallback;
  };

  return wrapper;
};

const validate = {
  isString: validator((value: JSONValue) => typeof value === 'string'),
  hasValidLength: validator(
    (value: Maybe<string>, max?: number) =>
      !!value && value.length >= STRING_MIN_LENGTH && value.length <= (max ?? Number.MAX_VALUE)
  ),
  hasProperties: validator((value: Maybe<JSONObject>, properties: string[]) =>
    properties.every(name => Object.prototype.hasOwnProperty.call(value, name))
  ),
  isSemVer: validator((value?: string) => !!value && semver.clean(value) !== null),
  isStringArray: validator((value: Maybe<JSONValue[]>) => !!value && value.every(item => typeof item === 'string')),
  isMatchesRegExp: validator((value: Maybe<string>, expression: RegExp) => !!value && expression.test(value)),
};

const parse = {
  string: parser((v: JSONValue) => (typeof v === 'string' ? v : undefined)),
  object: parser((v: JSONValue) => (typeof v === 'object' && !Array.isArray(v) && v !== null ? v : undefined)),
  array: parser((v: JSONValue) => (Array.isArray(v) ? v : undefined)),
  stringWithParams: (validators: Validator<Maybe<string>>[]) => {
    const callback = (value: JSONValue, params?: ParserWrapperParams): Maybe<string> =>
      parse.string(validators, params)(value);

    return callback;
  },
};

const utils = {
  getString: parse.stringWithParams([validate.hasValidLength('Invalid string length')]),
  getEmail: parse.stringWithParams([validate.isMatchesRegExp('Email address is not valid', EMAIL_REGEXP)]),
  getUrl: parse.stringWithParams([
    validate.isString('Url must be string'),
    validate.isMatchesRegExp("Url can't contain any non-URL-safe characters", URL_REGEXP),
  ]),
  getName: parse.string(
    [
      validate.isString('Name must be specified'),
      validate.hasValidLength('Name must be less than or equal to 214 characters', NAME_MAX_LENGTH),
    ],
    { strict: true }
  ) as Parser<string>,
  getVersion: parse.string(
    [validate.isString('Invalid version'), validate.isSemVer('Version must be parseable by node-semver')],
    { strict: true }
  ) as Parser<string>,
  getStringSet: (value: JSONValue, params?: ParserWrapperParams): Set<string> => {
    const items = new Set(
      (parse.array([validate.isStringArray('Field must be array of strings')], params)(value) ?? []) as string[]
    );

    return items;
  },
  getHomePage: parse.string([
    validate.isMatchesRegExp("Homepage can't contain any non-URL-safe characters", URL_REGEXP),
  ]),
  getBugsLocation: (value: JSONValue): Maybe<IBugsLocation> => {
    const location =
      parse.string([validate.hasValidLength('Invalid bugs location string length')])(value) ??
      parse.object([validate.hasProperties('Url is required field of bugs location object', ['url'])])(value);
    let result;

    if (location) {
      result = {
        url: utils.getUrl(typeof location === 'string' ? location : location?.url, {
          fieldName: 'Bugs location',
          strict: true,
        }) as string,
        email:
          typeof location === 'string' ? undefined : utils.getEmail(location?.email, { fieldName: 'Bugs location' }),
      };
    }

    return result;
  },
  getPerson: (value: JSONValue, fieldName: string): Maybe<IPerson> => {
    const person =
      utils.getString(value) ??
      parse.object([validate.hasProperties('Person name is required field', ['name'])])(value);
    let result;

    if (person) {
      const params = { fieldName: `Person (${fieldName})` };
      const { name, email, url } =
        typeof person === 'string'
          ? (person.match(PERSON_REGEXP)?.groups as Partial<IPerson>)
          : (person as Partial<IPerson>);

      result = {
        name: utils.getString(name, { ...params, strict: true }) as string,
        email: utils.getEmail(email, params),
        url: utils.getUrl(url, params),
      };
    }

    return result;
  },
  getPersons: (value: JSONValue, fieldName: string): IPerson[] =>
    (Array.isArray(value) ? value : []).reduce((acc, item) => {
      const person = utils.getPerson(item, fieldName);

      if (person) acc.push(person);

      return acc;
    }, [] as IPerson[]),
  getFunding: (value: JSONValue): IFunding[] => {
    const params = { fieldName: 'Funding' };

    return (Array.isArray(value) ? value : [value]).reduce((acc, item) => {
      const funding =
        utils.getString(item, params) ??
        parse.object([validate.hasProperties('Url is required field of funding object', ['url'])])(item);

      if (funding) {
        acc.push({
          url: utils.getUrl(typeof funding === 'string' ? funding : funding?.url, {
            ...params,
            strict: true,
          }) as string,
          type: typeof funding === 'string' ? undefined : utils.getString(funding?.type, params),
        });
      }

      return acc;
    }, [] as IFunding[]);
  },
};

export default utils;
