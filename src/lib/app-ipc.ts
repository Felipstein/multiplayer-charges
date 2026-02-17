import type { IPCEvent, IPCPayload } from '@/@types/ipc-payloads';

export namespace ApplicationIPC {
  export type Callback<E extends IPCEvent> =
    IPCPayload<E> extends undefined
      ? () => Promise<void> | void
      : (payload: IPCPayload<E>) => Promise<void> | void;

  export type Listener<E extends IPCEvent> = {
    callback: Callback<E>;
  };
}

export class ApplicationIPC {
  private readonly payloadsDispatched = new Map<IPCEvent, IPCPayload<any>[]>();
  private readonly listener = new Map<IPCEvent, ApplicationIPC.Listener<any>[]>();

  on<E extends IPCEvent>(
    event: E,
    listener: ApplicationIPC.Callback<E>,
    startNotifyingPendingPayloads = false,
  ) {
    const listeners = this.listener.get(event) || [];
    listeners.push({ callback: listener });
    this.listener.set(event, listeners);

    if (startNotifyingPendingPayloads) {
      const lastPayload = this.payloadsDispatched.get(event)?.pop();

      if (lastPayload) {
        listener(lastPayload);
      }
    }

    return () => this.off(event, listener);
  }

  off<E extends IPCEvent>(event: E, listener: ApplicationIPC.Callback<E>) {
    let listeners = this.listener.get(event);
    if (!listeners) {
      return;
    }

    listeners = listeners.filter(({ callback }) => callback !== listener);

    this.listener.set(event, listeners);
  }

  notifyAll<E extends IPCEvent>(
    event: E,
    ...rest: IPCPayload<E> extends undefined ? [] : [IPCPayload<E>]
  ) {
    const [payload] = rest;

    this.listener.get(event)?.forEach(({ callback }) => callback(payload));

    const these = this;

    return {
      store() {
        const payloads = these.payloadsDispatched.get(event) || [];
        payloads.push(payload);
        these.payloadsDispatched.set(event, payloads);
      },
    };
  }
}

export const ipc = new ApplicationIPC();
