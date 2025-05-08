import {
  ACCELERATION_VISUAL_SCALE,
  DIELECTRIC_VACUM_CONSTANT,
  EDGE_OVERLAP_ACCEPTABLE,
  GOD_FORCE,
  LOSS_FACTOR_ON_COLLISION,
  MAX_MASS,
  MIN_MASS,
  RENDER_VECTORS,
  VELOCITY_VISUAL_SCALE,
} from './constants';
import type { IRenderable } from './interfaces/renderable';
import type { ITickable } from './interfaces/tickable';
import { Position } from './position';
import { randomString } from './utils/random-string';
import { Vector } from './vector';
import type { World } from './world';

const MIN_LENGTH = 20;
const MAX_LENGTH = 25;

export enum ChargeValue {
  ELECTRON = -1.6 * 10 ** -19,
  PROTON = 1.6 * 10 ** -19,
  NEUTRON = 0,
}

type TickParams = {
  world: World;
  otherCharges: Charge[];
};

export class Charge implements ITickable<TickParams>, IRenderable {
  constructor(
    readonly id: string,
    readonly value: ChargeValue,
    public mass: number,
    public position: Position,
    public velocity: Vector,
    public acceleration: Vector,
  ) {}

  get length() {
    return (
      MIN_LENGTH + ((this.mass - MIN_MASS) / (MAX_MASS - MIN_MASS)) * (MAX_LENGTH - MIN_LENGTH)
    );
  }

  frame(deltaTime: number, params: TickParams) {
    const { otherCharges, world } = params;

    this.resolveOverlapWithEdge(world);

    let netForce = Vector.zero();

    if (otherCharges.length > 1) {
      for (const charge of otherCharges) {
        if (this === charge) {
          continue;
        }

        this.resolveCollision(charge);

        netForce = this.resolveCoulombAttraction(netForce, charge);
      }
    }

    if (!netForce.isNull) {
      this.acceleration = netForce.multiplyByScalar(1 / this.mass);
    }

    if (!this.velocity.isNull || !this.acceleration.isNull) {
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
        .add(this.acceleration.multiplyByScalar(deltaTime ** 2 / 2))
        .toPosition();

      this.position = newPosition;
      this.velocity = newVelocity;
    }
  }

  private resolveOverlapWithEdge(world: World) {
    const { position, length } = this;
    const radius = length / 2;

    const leftOverlap = world.innerLeftX - (position.x - radius);
    if (leftOverlap >= EDGE_OVERLAP_ACCEPTABLE) {
      position.x += leftOverlap;
    }

    const rightOverlap = position.x + radius - world.innerRightX;
    if (rightOverlap >= EDGE_OVERLAP_ACCEPTABLE) {
      position.x -= rightOverlap;
    }

    const topOverlap = world.innerTopY - (position.y - radius);
    if (topOverlap >= EDGE_OVERLAP_ACCEPTABLE) {
      position.y += topOverlap;
    }

    const bottomOverlap = position.y + radius - world.innerBottomY;
    if (bottomOverlap >= EDGE_OVERLAP_ACCEPTABLE) {
      position.y -= bottomOverlap;
    }
  }

  private resolveCollision(charge: Charge) {
    if (this.id.localeCompare(charge.id) > 0) {
      return;
    }

    const totalRadius = (charge.length + this.length) / 2;

    let difference = charge.position.vector.subtract(this.position.vector);
    const distance = difference.magnitude;

    if (distance >= totalRadius) {
      return;
    }

    const overlap = distance - totalRadius;
    if (overlap < 0) {
      const overlapDiff = -overlap / 2;

      charge.position = charge.position.vector
        .add(difference.changeMagnitude(overlapDiff))
        .toPosition();
      this.position = this.position.vector
        .add(difference.changeMagnitude(overlapDiff).multiplyByScalar(-1))
        .toPosition();

      difference = charge.position.vector.subtract(this.position.vector);
    }

    const normal = difference.versor;

    const normalRelativeVelocity = charge.velocity.subtract(this.velocity).dotProduct(normal);
    if (normalRelativeVelocity === 0) {
      return;
    }

    const reducedMass = (charge.mass * this.mass) / (charge.mass + this.mass);

    const systemKineticEnergy =
      (charge.mass * charge.velocity.dotProduct(normal) ** 2 +
        this.mass * this.velocity.dotProduct(normal) ** 2) /
      2;

    const kineticEnergyVariation = systemKineticEnergy * (LOSS_FACTOR_ON_COLLISION - 1);

    const restitutionCoefficient = Math.sqrt(
      1 - (2 * kineticEnergyVariation) / (reducedMass * normalRelativeVelocity ** 2),
    );

    const scalarImpulse =
      (-(1 + restitutionCoefficient) * normalRelativeVelocity) / (1 / charge.mass + 1 / this.mass);

    const finalVelocity1 = charge.velocity.add(
      normal.multiplyByScalar(scalarImpulse / charge.mass),
    );

    const finalVelocity2 = this.velocity.subtract(
      normal.multiplyByScalar(scalarImpulse / this.mass),
    );

    charge.velocity = finalVelocity1;
    this.velocity = finalVelocity2;
  }

  private resolveCoulombAttraction(netForce: Vector, charge: Charge) {
    const difference = this.position.vector.subtract(charge.position.vector);
    const distanceSquared = difference.dotProduct(difference) * 10 ** -6; // simulate in meters

    if (distanceSquared === 0) {
      return netForce;
    }

    const electricForceModule =
      ((DIELECTRIC_VACUM_CONSTANT * Math.abs(this.value) * Math.abs(charge.value)) /
        distanceSquared) *
      GOD_FORCE;

    let sign = this.value * charge.value;
    if (sign !== 0) sign /= Math.abs(sign);

    const force = difference.changeMagnitude(electricForceModule).multiplyByScalar(sign);

    return netForce.add(force);
  }

  render(ctx: CanvasRenderingContext2D, _canvas: HTMLCanvasElement) {
    const styles: Record<ChargeValue, { stroke: string; glowColor: string; symbol: string }> = {
      [ChargeValue.ELECTRON]: {
        stroke: 'rgb(53, 186, 255)',
        glowColor: 'rgba(0, 192, 255, 0.8)',
        symbol: '-',
      },
      [ChargeValue.PROTON]: {
        stroke: 'rgb(255, 66, 82)',
        glowColor: 'rgba(255, 64, 80, 0.8)',
        symbol: '+',
      },
      [ChargeValue.NEUTRON]: {
        stroke: 'rgb(199, 204, 212)',
        glowColor: 'rgba(150, 160, 172, 0.8)',
        symbol: '',
      },
    };

    const { stroke, glowColor, symbol } = styles[this.value];

    const radius = this.length / 2;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    ctx.shadowBlur = 25;
    ctx.shadowColor = glowColor;

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
    ctx.fillText(symbol, 0, 1);

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
    ctx.lineWidth = 2;
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

  static create(value: ChargeValue, mass: number, position: Position) {
    return new Charge(randomString(6), value, mass, position, Vector.zero(), Vector.zero());
  }
}
