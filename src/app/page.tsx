import Link from 'next/link';
import { Suspense } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroBanner } from '@/components/banner/hero-banner';
import { HomeProductSection } from '@/components/product/home-product-section';
import { VENDORS, CAT_META, DIY_BUILDERS, BRANDS } from '@/lib/site-data';
import { getBannersForLocation } from '@/lib/admin/banner-actions';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const banners = await getBannersForLocation('home');

  return (
    <>
      <Navbar />

      <main className="page-hero">
        <div className="hero-grid">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="dot" /> SYSTEM_ONLINE // INDIA_KEYBOARD_DB_v2
            </div>

            <h1 className="page-hero-title" style={{ animation: 'fade-up .65s .08s ease both' }}>
              INDIA<br />
              MECHANICAL<br />
              <span className="outline">KEYBOARD</span><br />
              DIRECTORY.
            </h1>

            <p className="page-hero-sub" style={{ animation: 'fade-up .65s .16s ease both' }}>
              Find trusted keyboard vendors, switches, keycaps, accessories and more across India.<br />
              <b>{VENDORS.length} vendors. {CAT_META.length} categories.</b>
            </p>

            <div className="hero-actions">
              <Link href="/keyboards" className="btn-primary">Browse Keyboards →</Link>
              <a href="#categories" className="btn-secondary">View Categories</a>
            </div>

            <div className="hero-actions hero-stats">
              <div className="stat-box"><span className="stat-num">{VENDORS.length}</span><span className="stat-label">Vendors</span></div>
              <div className="stat-box"><span className="stat-num">{CAT_META.length}</span><span className="stat-label">Categories</span></div>
              <div className="stat-box"><span className="stat-num">{BRANDS.length}</span><span className="stat-label">Brand Stores</span></div>
              <div className="stat-box"><span className="stat-num">{DIY_BUILDERS.length}</span><span className="stat-label">DIY Builders</span></div>
            </div>
          </div>

          <div className="hero-right" style={{ animation: 'fade-up .7s .15s ease both' }}>
            <div className="terminal">
              <div className="t-bar">
                <div className="t-dot" />
                <div className="t-dot" />
                <div className="t-dot" />
                <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginLeft: '8px' }}>keydir_status.sh</span>
              </div>
              <div className="t-line"><span className="t-prompt">$</span><span>./check_db --region=IN</span></div>
              <div className="t-line"><span className="t-ok">✓</span><span>vendors_loaded: {VENDORS.length}</span></div>
              <div className="t-line"><span className="t-ok">✓</span><span>categories: {CAT_META.length}</span></div>
              <div className="t-line"><span className="t-ok">✓</span><span>search: ACTIVE</span></div>
              <div className="t-dim">──────────────────</div>
              <div className="t-line"><span className="t-warn">▲</span><span>region: INDIA 🇮🇳</span></div>
              <div className="t-line"><span className="t-warn">▲</span><span>last_update: Jul-2026</span></div>
              <div className="t-line"><span className="t-warn">▲</span><span>affiliate_links: NONE</span></div>
              <div className="t-line"><span className="t-warn">▲</span><span>ads: NONE</span></div>
              <div className="t-dim">──────────────────</div>
              <div className="t-line"><span className="t-ok">●</span><span>STATUS: ONLINE</span></div>
            </div>
          </div>
        </div>
      </main>

      <div className="marquee-strip">
        <div className="marquee-track">
          <span>PRE-BUILT</span><span className="sep">///</span><span>SWITCHES</span><span className="sep">///</span><span>KEYCAPS</span><span className="sep">///</span><span>HALL EFFECT</span><span className="sep">///</span><span>BAREBONES</span><span className="sep">///</span><span>DESKPADS</span><span className="sep">///</span><span>PARTS &amp; TOOLS</span><span className="sep">///</span><span>MOUSE</span><span className="sep">///</span><span>ACCESSORIES</span><span className="sep">///</span><span>PC PARTS</span><span className="sep">///</span>
          <span>PRE-BUILT</span><span className="sep">///</span><span>SWITCHES</span><span className="sep">///</span><span>KEYCAPS</span><span className="sep">///</span><span>HALL EFFECT</span><span className="sep">///</span><span>BAREBONES</span><span className="sep">///</span><span>DESKPADS</span><span className="sep">///</span><span>PARTS &amp; TOOLS</span><span className="sep">///</span><span>MOUSE</span><span className="sep">///</span><span>ACCESSORIES</span><span className="sep">///</span><span>PC PARTS</span><span className="sep">///</span>
        </div>
      </div>

      {banners.length > 0 && <HeroBanner banners={banners} />}

      <Suspense fallback={null}>
        <HomeProductSection />
      </Suspense>

      <div className="page-body">
        {/* What's Inside */}
        <section style={{ padding: '80px 0 60px' }}>
          <div className="sec-head">
            <h2>WHAT&apos;S <em style={{ color: 'var(--green)' }}>INSIDE</em></h2>
            <div className="sec-tag" style={{ color: 'var(--green)' }}>4 SECTIONS</div>
          </div>
          <div className="feat-grid">
            <Link href="/keyboards" className="feat-item" style={{ background: 'var(--surface)' }}>
              <span className="feat-icon">⌨</span>
              <div className="feat-name">Keyboards</div>
              <div className="feat-desc">Browse mechanical keyboards across layouts, switch types, and price ranges from Indian vendors.</div>
            </Link>
            <Link href="/switches" className="feat-item" style={{ background: 'var(--surface)' }}>
              <span className="feat-icon">🔘</span>
              <div className="feat-name">Switches</div>
              <div className="feat-desc">Compare mechanical switches — linears, tactiles, and clickies from every brand available in India.</div>
            </Link>
            <Link href="/keycaps" className="feat-item" style={{ background: 'var(--surface)' }}>
              <span className="feat-icon">⬛</span>
              <div className="feat-name">Keycaps</div>
              <div className="feat-desc">Find keycap sets across profiles, materials, and legends — doubleshot, dye-sub, and more.</div>
            </Link>
            <Link href="/mouse" className="feat-item" style={{ background: 'var(--surface)' }}>
              <span className="feat-icon">🖱</span>
              <div className="feat-name">Mouse</div>
              <div className="feat-desc">Compare gaming and productivity mice — sensor specs, weight, connectivity, and pricing in India.</div>
            </Link>
            <a href="https://keydir.in/groupbuy/" className="feat-item" style={{ background: 'var(--surface)' }}>
              <span className="feat-icon">⏳</span>
              <div className="feat-name">Group Buys</div>
              <div className="feat-desc">Join community-driven group purchases for keyboards, keycaps and accessories available through community group buys and pre-orders.</div>
            </a>
          </div>
        </section>

        {/* Browse by Category */}
        <section style={{ padding: '0 0 80px' }} id="categories">
          <div className="sec-head">
            <h2>BROWSE BY <em style={{ color: 'var(--yellow)' }}>CATEGORY</em></h2>
            <div className="sec-tag" style={{ color: 'var(--yellow)' }}>{CAT_META.length} CATEGORIES</div>
          </div>
          <div className="cat-preview-grid">
            {CAT_META.map(cat => {
              const n = VENDORS.filter(v => v.cats.includes(cat.id)).length;
              const catHref =
                ['Switches'].includes(cat.id) ? '/switches' :
                ['Keycaps'].includes(cat.id) ? '/keycaps' :
                ['Mouse', 'Mousepad', 'Deskpad', 'Glass-pad'].includes(cat.id) ? '/mouse' :
                '/keyboards';
              return (
                <Link key={cat.id} href={catHref} className={`cat-prev-btn ${cat.col}`}>
                  <span className="cpb-icon">{cat.icon}</span>
                  <span className="cpb-lbl">{cat.label}</span>
                  <span className="cpb-count">{n} vendors</span>
            </Link>
              );
            })}
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/keyboards" className="btn-primary" style={{ marginTop: '8px' }}>Explore Full Directory →</Link>
          </div>
        </section>

        {/* Stats Row */}
        <section style={{ padding: '0 0 80px' }}>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-big">{VENDORS.length}</span>
              <span className="stat-lbl">Verified Vendors</span>
            </div>
            <div className="stat-item">
              <span className="stat-big">{CAT_META.length}</span>
              <span className="stat-lbl">Categories Covered</span>
            </div>
            <div className="stat-item">
              <span className="stat-big">{BRANDS.length}</span>
              <span className="stat-lbl">Brand Stores</span>
            </div>
            <div className="stat-item">
              <span className="stat-big">{DIY_BUILDERS.length}</span>
              <span className="stat-lbl">DIY Builders</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '0 0 80px' }}>
          <div className="cta-section" style={{ background: 'var(--cta-bg)', position: 'relative', overflow: 'hidden' }}>
            <div className="section-tag-label"><span className="dot" /> READY TO BUILD?</div>
            <h2 style={{ fontFamily: 'var(--f-d)', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-.05em', lineHeight: .9, marginBottom: '1.5rem' }}>
              Find Your Next<br />Keyboard Part.
            </h2>
            <p style={{ fontFamily: 'var(--f-m)', fontSize: '.95rem', maxWidth: '460px', marginBottom: '2rem', lineHeight: 1.75, color: 'var(--cta-text-muted)' }}>
              Pick a category. See every Indian vendor that carries it — instantly. No affiliate links. No ads. Pure signal.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/keyboards" className="btn-primary">Browse All Keyboards →</Link>
              <a href="https://github.com/SHADOW269/Keydir.in" target="_blank" rel="noopener" className="btn-secondary">Contribute on GitHub</a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
