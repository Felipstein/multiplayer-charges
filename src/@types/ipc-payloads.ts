type IPCPayloads = {
  'hud-state': { tickRate: number; particles: number };
};

export type IPCEvent = keyof IPCPayloads;
export type IPCPayload<E extends IPCEvent> = IPCPayloads[E];
