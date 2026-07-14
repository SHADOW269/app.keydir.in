'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
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
        <picture>
          {banner.mobileImage && <source media="(max-width: 768px)" srcSet={banner.mobileImage} />}
          <img src={banner.desktopImage || ''} alt={banner.title} className="hero-banner-img" />
        </picture>
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
