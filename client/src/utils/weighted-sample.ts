import { random } from './random';

type Weighted<T> = { item: T; weight: number };

export function weighedSample<T>(table: Weighted<T>[]) {
  const total = table.reduce((sum, t) => sum + t.weight, 0);
  const r = random(total);

  let accumulated = 0;
  for (const { item, weight } of table) {
    accumulated += weight;

    if (r < accumulated) {
      return item;
    }
  }

  return table[table.length - 1].item;
}
