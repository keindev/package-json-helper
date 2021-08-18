import { JSONValue } from '../types';
import { parsers } from '../utils/parsers';
import { validators } from '../utils/validators';
import { URL } from './URL';

export class Funding extends URL {
  /** The type of funding. */
  type = '';

  constructor(data: JSONValue) {
    super();

    if (typeof data !== 'undefined') {
      const funding = parsers.getObject([validators.hasProperties('Url is required field of funding object', ['url'])])(
        typeof data === 'string' ? { url: data } : data
      ) as Partial<Funding>;

      if (funding.url) this.url = funding.url;
      if (funding.type) this.type = funding.type;
    } else {
      throw new Error('BugsLocation must be string or object');
    }
  }
}
