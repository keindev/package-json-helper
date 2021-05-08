export enum ErrorType {
  NameIsUndefined = 'package name is undefined',
  NameIsEmpty = 'package name is empty',
  InvalidVersion = 'invalid semantic version',
  InvalidURL = 'invalid url value',
  InvalidEmail = 'invalid email address',
  InvalidLicense = 'invalid license value',
}

export const error = (type: ErrorType): Error => new Error(type);
