export function random(): number;
export function random(max: number): number;
export function random(min: number, max: number): number;
export function random<T>(array: T[]): T;
export function random(str: string): string;

export function random<T>(
  maxOrMinOrArrayOrStringOrNothing?: number | T[] | string,
  maxOrNothing?: number,
): number | T {
  if (typeof maxOrMinOrArrayOrStringOrNothing === 'string') {
    // @ts-expect-error
    return _random4(maxOrMinOrArrayOrStringOrNothing);
  }

  if (maxOrMinOrArrayOrStringOrNothing instanceof Array) {
    return _random3(maxOrMinOrArrayOrStringOrNothing);
  }

  if (typeof maxOrNothing === 'number') {
    return _random2(maxOrMinOrArrayOrStringOrNothing!, maxOrNothing);
  }

  if (typeof maxOrMinOrArrayOrStringOrNothing === 'number') {
    return _random1(maxOrMinOrArrayOrStringOrNothing);
  }

  return Math.random();
}

function _random1(max: number) {
  const value = Math.random() * max;

  return max > 1 ? Math.floor(value) : value;
}

function _random2(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function _random3<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

function _random4(str: string) {
  return str[Math.floor(Math.random() * str.length)];
}
