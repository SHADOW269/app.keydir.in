'use client';

import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';

export function FooterThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="footer-theme-toggle"
      aria-label="Toggle theme"
    >
      <span className="leading-none">{theme === 'dark' ? '◑' : '◐'}</span>
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
