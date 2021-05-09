export const testUrl = (value: string): boolean =>
  /^(?:(git\+)?http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w!#$&'()*+,./:;=?@[\]~-]+$/.test(value);

export const testEmail = (value: string): boolean =>
  /^[\w!#$%&'*+./=?^`{|}~-]+@[\da-z-]+(?:\.[\da-z-]+)*$/i.test(value);
