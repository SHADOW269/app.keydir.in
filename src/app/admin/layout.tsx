import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: '▸' },
  { label: 'Products', href: '/admin/products', icon: '▸' },
  { label: 'Vendors', href: '/admin/vendors', icon: '▸' },
  { label: 'Brands', href: '/admin/brands', icon: '▸' },
  { label: 'Banners', href: '/admin/banners', icon: '▸' },
  { label: 'Scraper', href: '/admin/scraper', icon: '▸' },
  { label: 'Users', href: '/admin/users', icon: '▸' },
  { label: 'Badges', href: '/admin/badges', icon: '▸' },
  { label: 'Votes', href: '/admin/votes', icon: '▸' },
  { label: 'Community', href: '/admin/community', icon: '▸' },
  { label: 'Settings', href: '/admin/settings', icon: '▸' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <span className="admin-sidebar-logo">◈</span>
            <span className="admin-sidebar-title">ADMIN</span>
          </div>
          <nav className="admin-nav">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="admin-nav-link">
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="admin-sidebar-footer">
            <Link href="/" className="admin-nav-link">
              <span className="admin-nav-icon">◂</span>
              Back to Site
            </Link>
          </div>
        </aside>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
}
