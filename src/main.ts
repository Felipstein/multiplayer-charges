import { Charge, ChargeValue } from './charge';
import { MAX_MASS, MIN_MASS } from './constants';
import { Game } from './game';
import { ipc } from './lib/app-ipc';
import { Position } from './position';
import { random } from './utils/random';
// import { weighedSample } from './utils/weighted-sample';
// import { Vector } from './vector';
import { World } from './world';

const canvas = document.getElementById('root') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const world = new World(0, 0, canvas.width, canvas.height, 0);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  world.width = canvas.width;
  world.height = canvas.height;
}

window.addEventListener('resize', resize);
resize();

const game = new Game(world);

// for (let i = 0; i < 50; i++) {
//   const value = weighedSample([
//     { item: ChargeValue.ELECTRON, weight: 44 },
//     { item: ChargeValue.PROTON, weight: 44 },
//     { item: ChargeValue.NEUTRON, weight: 12 },
//   ]);

//   const charge = Charge.create(
//     value,
//     random(MIN_MASS, MAX_MASS),
//     new Position(random(world.width), random(world.height)),
//   );

//   setTimeout(() => {
//     if (random() > 0.9) {
//       charge.velocity = new Vector(random(-0.5, 0.5), random(-0.5, 0.5));
//     }
//   }, 1000);

//   game.addCharge(charge);
// }

// game.addCharge(
//   Charge.create(ChargeValue.ELECTRON, 40, new Position(random(world.width), random(world.height))),
// );
// game.addCharge(
//   Charge.create(ChargeValue.PROTON, 40, new Position(random(world.width), random(world.height))),
// );

document.addEventListener('contextmenu', (event) => event.preventDefault());

canvas.addEventListener('mousedown', (event) => {
  const clickedPos = new Position(event.x, event.y);

  const charge = game.getChargeFromPoint(clickedPos);

  if (charge) {
    if (event.button === 0) {
      const distanceFromCenter = charge.position.vector.subtract(clickedPos.vector);
      const direction = distanceFromCenter.versor;

      const intensity = distanceFromCenter.magnitude / (charge.length / 2);
      const force = direction.multiplyByScalar(intensity);

      charge.velocity = charge.velocity.add(force);
    }

    if (event.button === 1) {
      const total = event.shiftKey ? 10 : 1;
      charge.mass += event.ctrlKey ? -total : total;
    }

    if (event.button === 2) {
      game.removeCharge(charge.id);
    }

    return;
  }

  let value: ChargeValue;
  switch (event.button) {
    case 0:
      value = ChargeValue.ELECTRON;
      break;
    case 2:
      value = ChargeValue.PROTON;
      break;
    default:
      value = ChargeValue.NEUTRON;
  }

  game.addCharge(Charge.create(value, random(MIN_MASS, MAX_MASS), clickedPos));
});

ipc.notifyAll('hud-state', { tickRate: 60, particles: game.charges.length }).store();

let initialTime = Date.now();

function frame() {
  const currentTime = Date.now();
  const deltaTime = currentTime - initialTime;
  initialTime = currentTime;

  game.frame(deltaTime);

  render();
  requestAnimationFrame(frame);
}

function render() {
  renderBackground();

  for (const charge of game.charges) {
    charge.render(ctx, canvas);
  }
}

function renderBackground() {
  const { width, height } = canvas;

  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.4,
    0,
    width * 0.5,
    height * 0.4,
    Math.max(width, height),
  );
  gradient.addColorStop(0, '#05070d');
  gradient.addColorStop(1, '#0d111a');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#0d172c';
  ctx.lineWidth = world.edgeLength;
  ctx.strokeRect(world.innerLeftX / 2, world.innerTopY / 2, world.innerRightX, world.innerBottomY);

  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = noiseCanvas.height = 128;

  const noiseCtx = noiseCanvas.getContext('2d') as CanvasRenderingContext2D;
  const image = noiseCtx.createImageData(128, 128);

  for (let i = 0; i < image.data.length; i += 4) {
    const val = Math.random() * 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = val;
    image.data[i + 3] = 0.05 * 255;
  }

  noiseCtx.putImageData(image, 0, 0);
  const noise = ctx.createPattern(noiseCanvas, 'repeat')!;

  ctx.fillStyle = noise;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
}

frame();
