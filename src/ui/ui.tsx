import { useState } from 'react';

import { useIPC } from './hooks/use-ipc';

export function UI() {
  const [tickRate, setTickRate] = useState(0);
  const [particles, setParticles] = useState(0);

  useIPC(
    'hud-state',
    ({ tickRate, particles }) => {
      setTickRate(tickRate);
      setParticles(particles);
    },
    true,
  );

  return (
    <>
      <aside className="fixed left-4 top-36 w-44 cursor-default space-y-2 rounded-lg border border-blue-950 bg-gray-950/80 px-5 py-2.5 text-blue-100 opacity-10 shadow-lg shadow-blue-950/10 backdrop-blur-[2px] transition-all hover:opacity-100">
        <h2 className="text-lg font-medium">Scoreboard</h2>

        <hr className="text-blue-950" />

        <ul className="pt-1">
          <li className="flex items-center justify-between gap-1">
            <span>Player1</span>
            <span>1200</span>
          </li>
          <li className="flex items-center justify-between gap-1">
            <span>Player2</span>
            <span>950</span>
          </li>
          <li className="flex items-center justify-between gap-1">
            <span>Player3</span>
            <span>500</span>
          </li>
        </ul>
      </aside>

      <footer className="pointer-events-none fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-16">
        <span className="text-zinc-300/60">Tick Rate: {tickRate}</span>
        <span className="text-zinc-300/60">Particles: {particles}</span>
      </footer>
    </>
  );
}
