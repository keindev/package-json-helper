import { JSONValue } from '../types.js';

export default abstract class Field {
  abstract getSnapshot(): JSONValue;
}
