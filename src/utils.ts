import parsers from './parsers';
import { IBugsLocation, JSONValue } from './types';
import validators from './validators';

const PACKAGE_NAME_MAX_LENGTH = 215;
const PACKAGE_NAME_MIN_LENGTH = 6;

const { hasValidLength, isEmailOrUndefined, isSemVer, isString, isStringArray, isUrl, isUrlOrUndefined } = validators;
const { parseArrayOrUndefined, parseStringOrUndefined, parseString } = parsers;

export default {
  getString: parseStringOrUndefined(),
  getName: parseString([
    isString('Invalid package name'),
    hasValidLength('Package name must be less than or equal to 214 characters', {
      max: PACKAGE_NAME_MAX_LENGTH,
      min: PACKAGE_NAME_MIN_LENGTH,
    }),
  ]),
  getVersion: parseString([isString('Invalid package version'), isSemVer('Version must be parseable by node-semver')]),
  getKeywords: (value: JSONValue): string[] => {
    const keywords = parseArrayOrUndefined([isStringArray('Package keywords must be array of strings')])(value) ?? [];

    return keywords.map(keyword => `${keyword}`);
  },
  getHomePage: parseStringOrUndefined([isUrlOrUndefined("Package homepage can't contain any non-URL-safe characters")]),
  getBugsLocation: (value: JSONValue): IBugsLocation | undefined => {
    const toUrl = parseString([
      isString('Bugs location url must be string'),
      isUrl("Bugs location url can't contain any non-URL-safe characters"),
    ]);
    const toEmail = parseStringOrUndefined([isEmailOrUndefined('Bugs location email address is not valid')]);
    let location;

    if (typeof value === 'string') {
      location = { url: toUrl(value), email: undefined };
    } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      location = { url: toUrl(value?.url), email: toEmail(value?.email) };
    }

    return location;
  },
};
