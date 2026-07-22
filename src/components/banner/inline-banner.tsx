'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface InlineBanner {
  id: string;
  title: string;
  desktopImage: string | null;
  mobileImage: string | null;
  linkUrl: string | null;
  openNewTab: boolean;
}

function BannerLink({ banner, children }: { banner: InlineBanner; children: React.ReactNode }) {
  const handleClick = () => {
    import('@/lib/admin/banner-actions').then(m => m.trackBannerClick(banner.id));
  };
  if (banner.linkUrl) {
    const openBlank = banner.openNewTab || banner.linkUrl.startsWith('http');
    if (openBlank) {
      return <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-banner-link" onClick={handleClick}>{children}</a>;
    }
    return <Link href={banner.linkUrl} className="inline-banner-link" onClick={handleClick}>{children}</Link>;
  }
  return <div className="inline-banner-link">{children}</div>;
}

export function InlineBanner({ banner }: { banner: InlineBanner }) {
  const viewed = useRef(false);

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    import('@/lib/admin/banner-actions').then(m => m.trackBannerView(banner.id));
  }, [banner.id]);

  if (!banner.desktopImage && !banner.mobileImage) return null;

  return (
    <div className="inline-banner">
      <BannerLink banner={banner}>
        <picture>
          {banner.mobileImage && <source media="(max-width: 768px)" srcSet={banner.mobileImage} />}
          <img src={banner.desktopImage || ''} alt={banner.title} className="inline-banner-img" />
        </picture>
      </BannerLink>
    </div>
  );
}
