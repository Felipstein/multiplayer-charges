export interface IRenderable {
  render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void;
}
