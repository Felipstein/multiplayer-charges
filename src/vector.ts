import { Position } from './position';

export class Vector {
  constructor(
    public x: number,
    public y: number,
  ) {}

  get isNull() {
    return this.x === 0 && this.y === 0;
  }

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  get magnitudeSquared() {
    return this.dotProduct(this);
  }

  get versor() {
    if (this.magnitude === 0) {
      return Vector.zero();
    }

    return this.multiplyByScalar(1 / this.magnitude);
  }

  get componentX() {
    return new Vector(this.x, 0);
  }

  get componentY() {
    return new Vector(0, this.y);
  }

  add(vector: Vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector: Vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  multiplyByScalar(scalar: number) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  dotProduct(vector: Vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  changeMagnitude(magnitude: number) {
    return this.versor.multiplyByScalar(magnitude);
  }

  toPosition() {
    return new Position(this.x, this.y);
  }

  isLessThan(scalar: number) {
    return this.x < scalar && this.x > -scalar && this.y < scalar && this.y > -scalar;
  }

  static zero() {
    return new Vector(0, 0);
  }
}
