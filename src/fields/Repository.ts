import { JSONValue } from '../types';
import { cast, parsers } from '../utils/parsers';
import { validators } from '../utils/validators';
import { URL } from './URL';

export class Repository extends URL {
  type = '';
  directory = '';

  constructor(data: JSONValue) {
    super();

    if (typeof data !== 'undefined') {
      const repository = parsers.getObject([
        validators.hasProperties('Url is required field of repository object', ['url']),
      ])(typeof data === 'string' ? { url: data } : data) as Partial<Repository> & { url: string };

      this.url = repository.url;
      this.type = cast.toString(repository.type);
      this.directory = cast.toString(repository.directory);
    } else {
      throw new Error('Repository must be string or object');
    }
  }
}
