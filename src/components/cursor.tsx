'use client';

import { useEffect, useRef } from 'react';

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      cursor.style.display = 'none';
      return;
    }

    function onMove(e: MouseEvent) {
      cursor!.style.left = `${e.clientX - 9}px`;
      cursor!.style.top = `${e.clientY - 9}px`;
      cursor!.style.opacity = '1';
    }

    function onEnter() { cursor!.classList.remove('off'); }
    function onLeave() { cursor!.classList.add('off'); }

    // Enlarge on interactive elements
    function onOver(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, input, select, textarea, label, [role="button"]')) {
        cursor!.classList.add('big');
      }
    }
    function onOut(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, input, select, textarea, label, [role="button"]')) {
        cursor!.classList.remove('big');
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return <div id="cursor" ref={cursorRef} style={{ opacity: 0 }} />;
}
