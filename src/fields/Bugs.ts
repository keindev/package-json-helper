import { JSONValue } from '../types';
import { parsers } from '../utils/parsers';
import { validators } from '../utils/validators';
import { Link } from './Link';

export class BugsLocation extends Link {
  constructor(data: JSONValue) {
    super();

    if (typeof data !== 'undefined') {
      const location = parsers.getObject([validators.hasProperties('Bugs location url is required field', ['url'])])(
        typeof data === 'string' ? { url: data } : data
      ) as Partial<Link>;

      if (location.url) this.url = location.url;
      if (location.email) this.email = location.email;
    } else {
      throw new Error('BugsLocation must be string or object');
    }
  }
}
