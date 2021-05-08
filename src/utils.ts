import fs from 'fs';
import path from 'path';

import { error, ErrorType } from './errors';
import { IBugsLocation, JSONObject, JSONValue } from './types';

export const toPackageObject = (value: string | JSONObject): JSONObject => {
  const data =
    typeof value === 'string' || typeof value === 'undefined'
      ? (JSON.parse(fs.readFileSync(value ?? path.resolve(process.cwd(), 'package.json'), 'utf-8')) as JSONObject)
      : value;

  return data;
};

export const toString = (value: JSONValue): string => (typeof value === 'string' ? value : '');

export const toArray = (value: JSONValue): JSONValue[] => (Array.isArray(value) ? value : []);

export const toUrl = (value: JSONValue): string => {
  const url = toString(value);

  if (
    typeof value !== 'undefined' &&
    !/^(?:(git\+)?http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+$/.test(url)
  ) {
    throw error(ErrorType.InvalidURL);
  }

  return url;
};

export const toEmail = (value: JSONValue): string => {
  const email = toString(value);

  if (!/^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*$/i.test(email)) throw error(ErrorType.InvalidEmail);

  return email;
};

export const toKeywords = (list: JSONValue[] | Set<string>): string[] => {
  const keywords = Array.isArray(list)
    ? list.map(item => (typeof item === 'string' || typeof item === 'number' ? `${item}` : ''))
    : [...list.values()];

  return keywords.filter(Boolean).sort();
};

export const toBugsLocation = (value: JSONValue): IBugsLocation | undefined => {
  let location;

  if (typeof value === 'string') {
    location = { url: toUrl(value), email: undefined };
  } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    location = { url: toUrl(value?.url), email: toEmail(value?.email) };
  }

  return location;
};
