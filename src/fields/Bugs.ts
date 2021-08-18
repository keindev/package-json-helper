import { JSONValue } from '../types';
import { cast, parsers } from '../utils/parsers';
import { validators } from '../utils/validators';
import { Link } from './Link';

export class BugsLocation extends Link {
  constructor(data: JSONValue) {
    super();

    if (typeof data !== 'undefined') {
      const location = parsers.getObject([validators.hasProperties('Bugs location url is required field', ['url'])])(
        typeof data === 'string' ? { url: data } : data
      ) as Partial<Link> & { url: string };

      this.url = location.url;
      this.email = cast.toString(location.email);
    } else {
      throw new Error('BugsLocation must be string or object');
    }
  }
}
