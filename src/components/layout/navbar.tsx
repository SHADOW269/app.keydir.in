'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { logout } from '@/lib/auth/actions';
import { GlobalSearch } from './global-search';
import { GitCompareArrows, ChevronDown } from 'lucide-react';
import { getCompareCount, getCompareCategory, getCompareProducts, onCompareChange, loadCompareFromStorage } from '@/lib/compare-store';
import Image from 'next/image';

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
  const [user, setUser] = useState<{ username: string; isAdmin: boolean; avatarUrl: string | null; displayName: string | null; email: string | null } | null>(null);
  const [compareCount, setCompareCount] = useState(0);
  const [compareCategory, setCompareCategory] = useState<string | null>(null);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const stored = loadCompareFromStorage();
      setCompareCount(stored.products.length);
      setCompareCategory(stored.category);
      setCompareSlugs(stored.products.map((p) => p.slug));
    }, 0);
    return onCompareChange(() => {
      setCompareCount(getCompareCount());
      setCompareCategory(getCompareCategory());
      setCompareSlugs(getCompareProducts().map((p) => p.slug));
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
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
            avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            displayName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            email,
          });
        }
      });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
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
                ? `/compare/${compareCategory || 'keyboards'}?products=${compareSlugs.join(',')}`
                : `/compare/${compareCategory || 'keyboards'}`}
              className="nav-compare-icon"
              aria-label={`Compare ${compareCount} product${compareCount !== 1 ? 's' : ''}`}
            >
              <GitCompareArrows size={18} strokeWidth={1.5} />
              <span className="nav-compare-badge">{Math.min(compareCount, 4)}</span>
            </Link>
          )}

          {user ? (
            <div ref={profileRef} className={`nav-profile${profileOpen ? ' open' : ''}`}>
              <button
                className="nav-profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : null}
                <span>{user.displayName || user.username}</span>
                <ChevronDown size={12} />
              </button>
              <div className="nav-dropdown">
                <Link href={`/profile/${user.username}`} onClick={() => setProfileOpen(false)}>
                  Profile
                </Link>
                <Link href="/settings" onClick={() => setProfileOpen(false)}>
                  Settings
                </Link>
                <form action={logout}>
                  <button type="submit">Sign Out</button>
                </form>
              </div>
            </div>
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
            <Link href="/settings" onClick={() => setMobileOpen(false)}>Settings</Link>
            <form action={logout}>
              <button type="submit">Sign Out</button>
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
