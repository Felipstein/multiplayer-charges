import { ACCELERATION_VISUAL_SCALE, RENDER_VECTORS, VELOCITY_VISUAL_SCALE } from './constants';
import type { IRenderable } from './interfaces/renderable';
import type { ITickable } from './interfaces/tickable';
import { Position } from './position';
import { randomString } from './utils/random-string';
import { Vector } from './vector';
import type { World } from './world';

export enum ChargeValue {
  ELECTRON = -1.6 * 10 ** -19,
  PROTON = 1.6 * 10 ** -19,
}

type TickParams = {
  world: World;
  otherCharges: Charge[];
};

export class Charge implements ITickable<TickParams>, IRenderable {
  constructor(
    readonly id: string,
    readonly value: ChargeValue,
    readonly mass: number,
    public position: Position,
    public velocity: Vector,
    public acceleration: Vector,
  ) {}

  get length() {
    return this.mass;
  }

  frame(deltaTime: number, params: TickParams) {
    const { otherCharges, world } = params;

    if (!this.velocity.isNull) {
      if (this.velocity.isLessThan(0.001)) {
        this.velocity = Vector.zero();
      }

      let newVelocity = this.velocity.add(this.acceleration.multiplyByScalar(deltaTime));

      const damping = 0.98;
      newVelocity = newVelocity.multiplyByScalar(damping);

      if (this.isCollidedHorizontallyOnEdge(world)) {
        newVelocity.x *= -1;
      }

      if (this.isCollidedVerticallyOnEdge(world)) {
        newVelocity.y *= -1;
      }

      const newPosition = this.position.vector
        .add(newVelocity.multiplyByScalar(deltaTime))
        .add(this.acceleration.multiplyByScalar(deltaTime ** 2 / 2));

      this.position = newPosition.toPosition();
      this.velocity = newVelocity;
    }

    if (otherCharges.length > 1) {
      for (const charge of otherCharges) {
        if (this === charge) {
          continue;
        }

        const totalRadius = (charge.length + this.length) / 2;

        const distance = charge.position.vector.subtract(this.position.vector);
        const isCollided = distance.magnitude < totalRadius;

        if (isCollided) {
          const elapsed = (totalRadius - distance.magnitude) / 2;
          charge.position = charge.position.vector
            .add(distance.changeMagnitude(elapsed))
            .toPosition();
          this.position = this.position.vector
            .add(distance.changeMagnitude(elapsed).multiplyByScalar(-1))
            .toPosition();

          const normal = distance.versor;

          const normalRelativeVelocity = charge.velocity.subtract(this.velocity).dotProduct(normal);
          if (normalRelativeVelocity === 0) {
            continue;
          }

          const reducedMass = (charge.mass * this.mass) / (charge.mass + this.mass);

          const systemKineticEnergy =
            (charge.mass * charge.velocity.dotProduct(normal) ** 2 +
              this.mass * this.velocity.dotProduct(normal) ** 2) /
            2;

          const lossFactor = 0.5; // 50%
          const kineticEnergyVariation = systemKineticEnergy * (lossFactor - 1);

          const restitutionCoefficient = Math.sqrt(
            1 - (2 * kineticEnergyVariation) / (reducedMass * normalRelativeVelocity ** 2),
          );

          const scalarImpulse =
            (-(1 + restitutionCoefficient) * normalRelativeVelocity) /
            (1 / charge.mass + 1 / this.mass);

          const finalVelocity1 = charge.velocity.add(
            normal.multiplyByScalar(scalarImpulse / charge.mass),
          );

          const finalVelocity2 = this.velocity.subtract(
            normal.multiplyByScalar(scalarImpulse / this.mass),
          );

          charge.velocity = finalVelocity1;
          this.velocity = finalVelocity2;
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement) {
    const stroke = this.value === ChargeValue.ELECTRON ? 'rgb(53, 186, 255)' : 'rgb(255, 66, 82)';

    const radius = this.length / 2;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    ctx.shadowBlur = 25;
    ctx.shadowColor =
      this.value === ChargeValue.ELECTRON ? 'rgba(0, 192, 255, 0.8)' : 'rgba(255, 64, 80, 0.8)';

    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = stroke;
    ctx.font = `600 ${radius * 1.6}px Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.value === ChargeValue.ELECTRON ? '-' : '+', 0, 1);

    if (RENDER_VECTORS) {
      this.drawVector(ctx, this.acceleration, '#f3a83e', ACCELERATION_VISUAL_SCALE);
      this.drawVector(ctx, this.velocity, '#4ef745', VELOCITY_VISUAL_SCALE);
    }

    ctx.restore();
  }

  private drawVector(
    ctx: CanvasRenderingContext2D,
    vector: Vector,
    color: string,
    visualScale = 1,
  ) {
    if (vector.isNull) {
      return;
    }

    const toX = vector.x * visualScale;
    const toY = vector.y * visualScale;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    const arrowSize = 10;
    const arrowAngle = Math.PI / 6; // 30 degreed
    const angle = Math.atan2(toY, toX);

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - arrowSize * Math.cos(angle - arrowAngle),
      toY - arrowSize * Math.sin(angle - arrowAngle),
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - arrowSize * Math.cos(angle + arrowAngle),
      toY - arrowSize * Math.sin(angle + arrowAngle),
    );
    ctx.stroke();
  }

  isPointInside(position: Position) {
    const radius = this.length / 2;

    const dx = this.position.x - position.x;
    const dy = this.position.y - position.y;

    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

    return distanceFromCenter <= radius;
  }

  private isCollidedHorizontallyOnEdge(world: World) {
    const { position, length } = this;
    const radius = length / 2;

    const leftEdge = position.x - radius;
    const rightEdge = position.x + radius;

    return world.isCollidedLeftOnEdge(leftEdge) || world.isCollidedRightOnEdge(rightEdge);
  }

  private isCollidedVerticallyOnEdge(world: World) {
    const { position, length } = this;
    const radius = length / 2;

    const topEdge = position.y - radius;
    const bottomEdge = position.y + radius;

    return world.isCollidedTopOnEdge(topEdge) || world.isCollidedBottomOnEdge(bottomEdge);
  }

  static create(value: ChargeValue, position: Position) {
    return new Charge(randomString(6), value, 20, position, Vector.zero(), Vector.zero());
  }
}
