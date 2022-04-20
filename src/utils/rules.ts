import { PackageType } from '../types.js';
import { URL_REGEXP, validators } from './validators.js';

const NAME_MAX_LENGTH = 214;

const rules = {
  name: [validators.hasValidLength('Name must be less than or equal to 214 characters', NAME_MAX_LENGTH)],
  version: [validators.isSemanticVersion('Version must be parseable by node-semver')],
  type: [validators.isEnum('Invalid package type', Object.values(PackageType))],
  homepage: [validators.isMatchesRegExp("Homepage can't contain any non-URL-safe characters", URL_REGEXP)],
};

export default rules;
