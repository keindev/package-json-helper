import { JSONValue } from '../types';

export default abstract class Field {
  abstract getSnapshot(): JSONValue;
}
