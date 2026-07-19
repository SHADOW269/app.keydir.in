import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

interface Props {
  breadcrumb: string;
  children: React.ReactNode;
}

export function CompareLayout({ breadcrumb, children }: Props) {
  return (
    <>
      <Navbar />
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
