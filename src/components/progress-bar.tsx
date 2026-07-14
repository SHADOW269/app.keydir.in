'use client';

import { useEffect } from 'react';

export function ProgressBar() {
  useEffect(() => {
    function onScroll() {
      const bar = document.getElementById('prog');
      if (!bar) return;
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div id="prog" />;
}
