'use client';

import { useTheme } from '@/components/theme-provider';

export function FooterThemeToggle() {
  const { theme, setTheme } = useTheme();

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
