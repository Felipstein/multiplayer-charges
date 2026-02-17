import type { Charge } from './charge';
import type { ITickable } from './interfaces/tickable';
import type { Position } from './position';
import type { World } from './world';

export class Game implements ITickable {
  readonly charges: Charge[] = [];

  constructor(public world: World) {}

  addCharge(charge: Charge) {
    this.charges.push(charge);
  }

  removeCharge(id: string) {
    const index = this.charges.findIndex((charge) => charge.id === id);

    if (index !== -1) {
      this.charges.splice(index, 1);
    }
  }

  getChargeFromPoint(position: Position) {
    return this.charges.find((charge) => charge.isPointInside(position)) || null;
  }

  frame(deltaTime: number) {
    for (const charge of this.charges) {
      charge.frame(deltaTime, {
        world: this.world,
        otherCharges: this.charges,
      });
    }
  }
}
