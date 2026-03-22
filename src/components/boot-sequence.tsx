'use client';

import { useEffect, useState } from 'react';

type BootPhase = 'show' | 'hide' | 'done';

export function BootSequence() {
  const [phase, setPhase] = useState<BootPhase>('show');

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('hide'), 3_400);
    const doneTimer = setTimeout(() => setPhase('done'), 3_950);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'done') {
    return null;
  }

  return (
    <div className={`boot-screen ${phase === 'hide' ? 'hide' : ''}`} aria-hidden="true">
      <div className="boot-logo">
        AGENT<span> GAUNTLET</span>
      </div>
      <div className="boot-wanted">✦ DEAD OR ALIVE ✦</div>
      <div className="boot-lines">
        <p className="boot-line">saddling up the playwright runtime........... OK</p>
        <p className="boot-line">loading frontier scenarios................... OK</p>
        <p className="boot-line">seeding bounty canary values................. OK</p>
        <p className="boot-line">★ DRAW! ENTER THE GAUNTLET ★</p>
      </div>
    </div>
  );
}
