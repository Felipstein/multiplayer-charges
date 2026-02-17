import { useEffect, type DependencyList } from 'react';

import type { IPCEvent } from '@/@types/ipc-payloads';
import { ipc, type ApplicationIPC } from '@/lib/app-ipc';

export function useIPC<E extends IPCEvent>(
  event: E,
  listener: ApplicationIPC.Callback<E>,
  deps?: DependencyList,
): void;

export function useIPC<E extends IPCEvent>(
  event: E,
  listener: ApplicationIPC.Callback<E>,
  startNotifyingPendingPayloads: boolean,
  deps?: DependencyList,
): void;

export function useIPC<E extends IPCEvent>(
  event: E,
  listener: ApplicationIPC.Callback<E>,
  startNotifyingPendingPayloadsOrDeps?: DependencyList | boolean,
  depsOrNothing?: DependencyList,
) {
  const startNotifyingPendingPayloads =
    typeof startNotifyingPendingPayloadsOrDeps === 'boolean'
      ? startNotifyingPendingPayloadsOrDeps
      : false;

  const deps = typeof depsOrNothing === 'undefined' ? [event] : [event, ...depsOrNothing];

  useEffect(() => {
    const off = ipc.on(event, listener, startNotifyingPendingPayloads);
    return () => off();
  }, deps);
}
