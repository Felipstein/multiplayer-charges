import { random } from './random';

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-!@#';

export function randomString(length = 6) {
  let string = '';

  for (let i = 0; i < length; i++) {
    string += random(chars);
  }

  return string;
}
