'use client';

import Link from 'next/link';

interface InlineBanner {
  id: string;
  title: string;
  desktopImage: string | null;
  mobileImage: string | null;
  linkUrl: string | null;
  openNewTab: boolean;
}

export function InlineBanner({ banner }: { banner: InlineBanner }) {
  if (!banner.desktopImage && !banner.mobileImage) return null;

  function Wrapper({ children }: { children: React.ReactNode }) {
    if (banner.linkUrl) {
      const isExternal = banner.linkUrl.startsWith('http');
      if (isExternal || banner.openNewTab) {
        return <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-banner-link">{children}</a>;
      }
      return <Link href={banner.linkUrl} className="inline-banner-link">{children}</Link>;
    }
    return <div className="inline-banner-link">{children}</div>;
  }

  return (
    <div className="inline-banner">
      <Wrapper>
        <picture>
          {banner.mobileImage && <source media="(max-width: 768px)" srcSet={banner.mobileImage} />}
          <img src={banner.desktopImage || ''} alt={banner.title} className="inline-banner-img" />
        </picture>
      </Wrapper>
    </div>
  );
}
