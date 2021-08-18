import { JSONValue } from '../types';
import { parsers } from '../utils/parsers';
import { validators } from '../utils/validators';
import { Link } from './Link';

const PERSON_REGEXP =
  /^(?<name>^[ 1-9_a-z-]+)(?<emailWrapper> <(?<email>[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*)>)?(?<urlWrapper> \((?<url>(?:(git\+)?http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+)\))?$/i;

export class Person extends Link {
  name = '';

  constructor(data: JSONValue) {
    super();

    if (typeof data !== 'undefined') {
      const person = parsers.getObject([validators.hasProperties('Person name is required field', ['name'])])(
        typeof data === 'string' ? data.match(PERSON_REGEXP)?.groups ?? {} : data
      ) as Partial<Person & Link>;

      if (person.name) this.name = person.name;
      if (person.url) this.url = person.url;
      if (person.email) this.email = person.email;
    } else {
      throw new Error('Person must be string or object');
    }
  }
}
