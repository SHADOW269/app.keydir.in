'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroBanner {
  id: string;
  title: string;
  desktopImage: string | null;
  mobileImage: string | null;
  linkUrl: string | null;
  linkType: string;
  openNewTab: boolean;
}

/*
 * BANNER SAFE AREA GUIDE (for admins uploading images)
 * ──────────────────────────────────────────────────
 * The hero uses object-fit: cover, so edges get cropped on certain screens.
 *
 * ┌──────────────────────────────────┐
 * │  TOP 20%    ← crop-safe zone     │
 * │  ┌────────────────────────────┐  │
 * │  │                            │  │
 * │  │   MIDDLE 60%               │  │
 * │  │   ★ PROTECTED ZONE ★       │  │
 * │  │   Keep logos, text, and    │  │
 * │  │   key visuals here.        │  │
 * │  │                            │  │
 * │  └────────────────────────────┘  │
 * │  BOTTOM 20%  ← crop-safe zone    │
 * └──────────────────────────────────┘
 *   LEFT 10% | MIDDLE 80% | RIGHT 10%
 *             ↑ protected     ↑ crop-safe
 *
 * On ultrawide (21:9), ~10% of each side may be hidden.
 * On mobile (16:9), top/bottom ~10% may be hidden.
 * Always keep essential content in the center 60% vertically
 * and center 80% horizontally.
 */

export function HeroBanner({ banners }: { banners: HeroBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(0);

  const next = useCallback(() => setCurrent((i) => (i + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + banners.length) % banners.length), [banners.length]);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, banners.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  function Wrapper({ children }: { children: React.ReactNode }) {
    if (banner.linkUrl) {
      const isExternal = banner.linkUrl.startsWith('http');
      if (isExternal || banner.openNewTab) {
        return <a href={banner.linkUrl} target={banner.openNewTab ? '_blank' : undefined} rel="noopener noreferrer" className="hero-banner-link">{children}</a>;
      }
      return <Link href={banner.linkUrl} className="hero-banner-link">{children}</Link>;
    }
    return <div className="hero-banner-link">{children}</div>;
  }

  const hasImage = !!(banner.desktopImage || banner.mobileImage);

  return (
    <div
      className="hero-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) dx > 0 ? prev() : next();
      }}
    >
      <Wrapper>
        <div className="hero-banner-inner">
          {hasImage ? (
            <picture>
              {banner.mobileImage && <source media="(max-width: 768px)" srcSet={banner.mobileImage} />}
              <img src={banner.desktopImage || banner.mobileImage || ''} alt={banner.title} className="hero-banner-img" loading="eager" />
            </picture>
          ) : (
            <div className="hero-placeholder">
              <div className="hero-placeholder-logo">KEYDIR</div>
              <div className="hero-placeholder-sub">// NO_BANNER_LOADED</div>
            </div>
          )}
          <div className="hero-banner-overlay" />
        </div>
      </Wrapper>

      {banners.length > 1 && (
        <>
          <button className="hero-nav hero-prev" onClick={prev} aria-label="Previous"><ChevronLeft size={20} /></button>
          <button className="hero-nav hero-next" onClick={next} aria-label="Next"><ChevronRight size={20} /></button>
          <div className="hero-dots">
            {banners.map((_, i) => (
              <button key={i} className={`hero-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
