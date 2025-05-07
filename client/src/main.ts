import { Charge, ChargeValue } from './charge';
import { Game } from './game';
import { ipc } from './lib/app-ipc';
import { Position } from './position';
import { World } from './world';

const canvas = document.getElementById('root') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

const world = new World(0, 0, canvas.width, canvas.height, 20);

const game = new Game(world);

document.addEventListener('contextmenu', (event) => event.preventDefault());

canvas.addEventListener('mousedown', (event) => {
  if (event.button !== 0 && event.button !== 2) {
    return;
  }

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

    if (event.button === 2) {
      game.removeCharge(charge.id);
    }

    return;
  }

  game.addCharge(
    Charge.create(event.button === 0 ? ChargeValue.ELECTRON : ChargeValue.PROTON, clickedPos),
  );
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

  ctx.strokeStyle = 'red';
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
