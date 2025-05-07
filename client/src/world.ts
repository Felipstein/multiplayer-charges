import type { Position } from './position';

const EDGE_OFFSET = 1;

export class World {
  constructor(
    private readonly x: number,
    private readonly y: number,
    readonly width: number,
    readonly height: number,
    readonly edgeLength: number,
  ) {}

  get innerLeftX() {
    return this.x + this.edgeLength;
  }

  get innerTopY() {
    return this.y + this.edgeLength;
  }

  get innerRightX() {
    return this.x + this.width - this.edgeLength;
  }

  get innerBottomY() {
    return this.y + this.height - this.edgeLength;
  }

  get outerLeftX() {
    return this.x;
  }

  get outerTopY() {
    return this.y;
  }

  get outerRightX() {
    return this.x + this.width;
  }

  get outerBottomY() {
    return this.y + this.height;
  }

  isCollidedLeftOnEdge(x: number) {
    return x >= this.outerLeftX - EDGE_OFFSET && x <= this.innerLeftX + EDGE_OFFSET;
  }

  isCollidedRightOnEdge(x: number) {
    return x >= this.innerRightX - EDGE_OFFSET && x <= this.outerRightX + EDGE_OFFSET;
  }

  isCollidedHorizontallyOnEdge(x: number) {
    return this.isCollidedLeftOnEdge(x) || this.isCollidedRightOnEdge(x);
  }

  isCollidedTopOnEdge(y: number) {
    return y >= this.outerTopY - EDGE_OFFSET && y <= this.innerTopY + EDGE_OFFSET;
  }

  isCollidedBottomOnEdge(y: number) {
    return y >= this.innerBottomY - EDGE_OFFSET && y <= this.outerBottomY + EDGE_OFFSET;
  }

  isCollidedVerticallyOnEdge(y: number) {
    return this.isCollidedTopOnEdge(y) || this.isCollidedBottomOnEdge(y);
  }

  isCollidedOnEdge(position: Position) {
    return (
      this.isCollidedHorizontallyOnEdge(position.x) || this.isCollidedVerticallyOnEdge(position.y)
    );
  }

  isOutsideHorizontally(x: number) {
    return x < this.outerLeftX || x > this.outerRightX;
  }

  isOutsideVertically(y: number) {
    return y < this.outerTopY || y > this.outerBottomY;
  }

  isOutside(position: Position) {
    return this.isOutsideHorizontally(position.x) || this.isOutsideVertically(position.y);
  }
}
