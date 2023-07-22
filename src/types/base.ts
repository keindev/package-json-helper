export enum CompareResult {
  More = 1,
  Less = -1,
  Equal = 0,
}

export type Maybe<T> = T | undefined;
export type JSONValue = undefined | string | number | boolean | null | JSONObject | JSONValue[];
export type JSONObject = { [Key in string]?: JSONValue };
