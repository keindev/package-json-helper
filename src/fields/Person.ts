import { JSONValue } from '../types';
import { cast, parsers } from '../utils/parsers';
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
      ) as Partial<Person & Link> & { name: string };

      this.name = person.name;
      this.url = cast.toString(person.url);
      this.email = cast.toString(person.email);
    } else {
      throw new Error('Person must be string or object');
    }
  }
}
