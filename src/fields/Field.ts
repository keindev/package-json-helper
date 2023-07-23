import { JSONValue } from '../types/base.js';

export abstract class Field {
  abstract getSnapshot(): JSONValue;
}
