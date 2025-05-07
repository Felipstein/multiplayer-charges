import { Vector } from './vector';

export class Position {
  constructor(
    public x: number,
    public y: number,
  ) {}

  get vector() {
    return new Vector(this.x, this.y);
  }
}
