export interface ITickable<P = void> {
  frame(deltaTime: number, params: P): void;
}
