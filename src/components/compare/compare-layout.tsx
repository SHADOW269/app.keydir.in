import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PublicBanners } from '@/components/banner/public-banners';
import Link from 'next/link';

interface Props {
  breadcrumb: string;
  bannerLocation?: string;
  children: React.ReactNode;
}

export function CompareLayout({ breadcrumb, bannerLocation, children }: Props) {
  return (
    <>
      <Navbar />
      {bannerLocation && <PublicBanners location={bannerLocation} />}
      <div className="page-body compare-page">
        <div className="product-breadcrumb">
          <Link href="/" className="hover:text-[var(--text)]">Home</Link>
          {' / '}
          <span className="text-[var(--text)]">{breadcrumb}</span>
        </div>
        {children}
      </div>
      <Footer />
    </>
  );
}
