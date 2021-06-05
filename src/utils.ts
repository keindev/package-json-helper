import {
    IBugsLocation, IDirectoryLocations, IFunding, IPerson, IRepository, JSONValue, Maybe, Primitive, Type,
} from './types';
import { checkValue } from './utils/validators';

const URL_REGEXP = /^(?:(git\+)?http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+$/;
const EMAIL_REGEXP = /^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*$/i;
const PERSON_REGEXP =
  /^(?<name>^[ 1-9_a-z-]+)(?<emailWrapper> <(?<email>[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*)>)?(?<urlWrapper> \((?<url>(?:(git\+)?http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+)\))?$/i;

const stringWithParams = (validators: IValidator<Maybe<string>>[]) => {
  const callback = (value: JSONValue, params?: IParserWrapperParams): Maybe<string> =>
    parse.string(validators, params)(value);

  return callback;
};

const utils = {
  getString: parse.stringWithParams([validate.hasValidLength('Invalid string length')]),
  getObject: parse.object([]),
  getEmail: parse.stringWithParams([validate.isMatchesRegExp('Email address is not valid', EMAIL_REGEXP)]),
  getUrl: parse.stringWithParams([
    validate.isString('Url must be string'),
    validate.isMatchesRegExp("Url can't contain any non-URL-safe characters", URL_REGEXP),
  ]),

  getStringMap: (value: JSONValue): Map<string, string> =>
    new Map<string, string>(
      Object.entries(utils.getObject(value) ?? {}).map(([name, script]) => [name, utils.getString(script) ?? ''])
    ),
  getHomePage: parse.string([
    validate.isMatchesRegExp("Homepage can't contain any non-URL-safe characters", URL_REGEXP),
  ]),
  getBugsLocation: (value: JSONValue): Maybe<IBugsLocation> => {
    const params = { fieldName: 'Bugs location' };
    const location =
      utils.getString(value, params) ??
      parse.object([validate.hasProperties('Bugs location url is required field', ['url'])])(value);
    let result;

    if (location) {
      result = {
        url: utils.getUrl(typeof location === 'string' ? location : location?.url, {
          ...params,
          strict: true,
        }) as string,
        email: typeof location === 'string' ? undefined : utils.getEmail(location?.email, params),
      };
    }

    return result;
  },
  getPerson: (value: JSONValue, fieldName: string): Maybe<IPerson> => {
    const params = { fieldName: `Person (${fieldName})` };
    const person =
      utils.getString(value, params) ??
      parse.object([validate.hasProperties('Person name is required field', ['name'])])(value);
    let result;

    if (person) {
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
  getType: parse.string([validate.isValidType('Invalid package type')]) as Parser<Type>,
  getBin: (value: JSONValue, packageName: string): Map<string, string> => {
    const bin = utils.getString(value, { fieldName: 'Bin' }) ?? utils.getStringMap(value);

    return typeof bin === 'string' ? new Map<string, string>([[packageName, bin]]) : bin;
  },
  getMan: (value: JSONValue): Set<string> => {
    const params = { fieldName: 'Man' };
    const man = utils.getString(value, params) ?? utils.getStringSet(value, params);

    return typeof man === 'string' ? new Set([man]) : man;
  },
  getDirectories: (value: JSONValue): Maybe<IDirectoryLocations> => utils.getObject(value),
  getRepository: (value: JSONValue): Maybe<IRepository> => {
    const params = { fieldName: 'Repository' };
    const repository =
      utils.getString(value, params) ??
      parse.object([validate.hasProperties('Url is required field of repository object', ['url'])])(value);
    let result;

    if (repository) {
      result = {
        type: typeof repository === 'string' ? undefined : utils.getString(repository?.type, params),
        url: utils.getUrl(typeof repository === 'string' ? repository : repository?.url, {
          ...params,
          strict: true,
        }) as string,
        directory: typeof repository === 'string' ? undefined : utils.getString(repository?.directory, params),
      };
    }

    return result;
  },
  getPeerDependenciesMeta: (value: JSONValue): Map<string, boolean> =>
    new Map<string, boolean>(
      Object.entries(utils.getObject(value) ?? {}).map(([name, meta]) => [
        name,
        !!(
          parse.object([
            validate.hasProperties('Marking a peer dependency as optional is required in PeerDependenciesMeta object', [
              'optional',
            ]),
          ])(meta) ?? {}
        )?.optional,
      ])
    ),
  getPublishConfig: (value: JSONValue): Map<string, Primitive> =>
    new Map<string, Primitive>(
      Object.entries(utils.getObject(value) ?? {}).map(([name, paramValue]) => [
        name,
        typeof paramValue === 'string' ||
        typeof paramValue === 'number' ||
        typeof paramValue === 'boolean' ||
        paramValue === null
          ? paramValue
          : null,
      ])
    ),
};

export default utils;
