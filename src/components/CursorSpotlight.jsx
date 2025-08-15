import React, { useEffect, useState } from "react";

export default function CursorSpotlight() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(pointer: coarse)');
    if (mq && mq.matches) setEnabled(false); // desativa em mobile

    const onMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const y = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
      document.documentElement.style.setProperty('--mx', x + 'px');
      document.documentElement.style.setProperty('--my', y + 'px');
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5]"
      style={{
        background: 'radial-gradient(200px 200px at var(--mx) var(--my), rgba(255,255,255,0.07), rgba(0,0,0,0) 60%)',
        mixBlendMode: 'screen',
        transition: 'background 120ms linear',
      }}
    />
  );
}