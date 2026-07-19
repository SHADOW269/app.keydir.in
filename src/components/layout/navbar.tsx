'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { logout } from '@/lib/auth/actions';
import { GlobalSearch } from './global-search';
import { User, GitCompareArrows } from 'lucide-react';
import { getCompareCount, getCompareCategory, getCompareProducts, onCompareChange, loadCompareFromStorage } from '@/lib/compare-store';

const NAV_ITEMS = [
  { href: '/keyboards', label: 'Keyboards' },
  { href: '/switches', label: 'Switches' },
  { href: '/keycaps', label: 'Keycaps' },
  { href: '/mouse', label: 'Mouse' },
];

const MORE_ITEMS = [
  { href: 'https://keydir.in/groupbuy/', label: 'Group Buy', external: true },
  { href: 'https://keydir.in/guide/', label: 'Guide', external: true },
  { href: 'https://keydir.in/builders/', label: 'Builders', external: true },
  { href: 'https://keydir.in/surfaces/', label: 'Surfaces', external: true },
  { href: 'https://keydir.in/contact/', label: 'Contact', external: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null);
  const [compareCount, setCompareCount] = useState(0);
  const [compareCategory, setCompareCategory] = useState<string | null>(null);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);

  useEffect(() => {
    const stored = loadCompareFromStorage();
    setCompareCount(stored.products.length);
    setCompareCategory(stored.category);
    setCompareSlugs(stored.products.map((p) => p.slug));
    return onCompareChange(() => {
      setCompareCount(getCompareCount());
      setCompareCategory(getCompareCategory());
      setCompareSlugs(getCompareProducts().map((p) => p.slug));
    });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const email = data.user.email || '';
        const username = data.user.user_metadata?.username || email.split('@')[0];
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim().toLowerCase());
        setUser({
          username,
          isAdmin: adminEmails.includes(email.toLowerCase()),
        });
      }
    });
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function isActive(href: string) {
    return pathname === href || pathname === href + '/';
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-block">
          <Link href="/" className="nav-logo">
            <span style={{ fontSize: '.7em' }}>⌨</span> KEYDIR.in
          </Link>
          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? 'active' : ''}
              >
                _{item.label}
              </Link>
            ))}
            <div ref={moreRef} className={`nav-dropdown-wrap${moreOpen ? ' active' : ''}`}>
              <button
                className="nav-dropdown-btn"
                onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }}
              >
                _More
              </button>
              <div className="nav-dropdown-menu">
                {MORE_ITEMS.map((item) => (
                  item.external ? (
                    <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                      _{item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={isActive(item.href) ? 'active' : ''}
                      onClick={() => setMoreOpen(false)}
                    >
                      _{item.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="nav-right">
          <GlobalSearch />

          {compareCount > 0 && (
            <Link
              href={compareSlugs.length > 0
                ? `/compare/${compareCategory || 'keyboard'}?products=${compareSlugs.join(',')}`
                : `/compare/${compareCategory || 'keyboard'}`}
              className="nav-compare-icon"
              aria-label={`Compare ${compareCount} product${compareCount !== 1 ? 's' : ''}`}
            >
              <GitCompareArrows size={18} strokeWidth={1.5} />
              <span className="nav-compare-badge">{Math.min(compareCount, 4)}</span>
            </Link>
          )}

          {user ? (
            <Link href={`/profile/${user.username}`} className="nav-profile-icon" aria-label="Profile">
              <User size={18} strokeWidth={1.5} />
            </Link>
          ) : (
            <Link href="/auth/login" className="nav-login">
              Login
            </Link>
          )}

          <button
            className="nav-ham"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div id="mob-nav" className={mobileOpen ? 'open' : ''}>
        <button id="mob-close" onClick={() => setMobileOpen(false)}>
          [ X ]
        </button>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
          >
            _{item.label}
          </Link>
        ))}
        {MORE_ITEMS.map((item) => (
          item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)}>
              _{item.label}
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
            >
              _{item.label}
            </Link>
          )
        ))}
        {user ? (
          <>
            <Link href={`/profile/${user.username}`} onClick={() => setMobileOpen(false)}>Profile</Link>
            <form action={logout}>
              <button type="submit">Logout</button>
            </form>
          </>
        ) : (
          <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
            Login
          </Link>
        )}
      </div>
    </>
  );
}
