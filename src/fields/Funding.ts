import { JSONValue } from '../types';
import { cast, parsers } from '../utils/parsers';
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
      ) as Partial<Funding> & { url: string };

      this.url = funding.url;
      this.type = cast.toString(funding.type);
    } else {
      throw new Error('Funding must be string or object');
    }
  }
}
