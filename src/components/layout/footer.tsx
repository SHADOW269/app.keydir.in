import Link from 'next/link';
import { FooterThemeToggle } from './footer-theme-toggle';

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div className="f-logo">⌨ KEYDIR.in</div>
          <div className="f-desc">
            Community-maintained directory of Indian mechanical keyboard vendors. No affiliate links. No ads. Just raw
            data for the keeb community.
          </div>
        </div>

        <div className="f-col">
          <h4>Navigate</h4>
          <ul>
            <li><Link href="/">_Home</Link></li>
            <li><Link href="/keyboards">_Keyboards</Link></li>
            <li><Link href="/switches">_Switches</Link></li>
            <li><Link href="/keycaps">_Keycaps</Link></li>
            <li><Link href="/mouse">_Mouse</Link></li>
            <li><a href="https://keydir.in/guide/">_Guide</a></li>
            <li><a href="https://keydir.in/groupbuy/">_Group Buys</a></li>
            <li><a href="https://keydir.in/about/">_About</a></li>
          </ul>
        </div>

        <div className="f-col">
          <h4>Categories</h4>
          <ul>
            <li><Link href="/keyboards">Keyboards</Link></li>
            <li><Link href="/switches">Switches</Link></li>
            <li><Link href="/keycaps">Keycaps</Link></li>
            <li><Link href="/mouse">Mouse</Link></li>
          </ul>
        </div>

        <div className="f-col">
          <h4>Project</h4>
          <ul>
            <li><a href="https://keydir.in/contact/">_Contact</a></li>
            <li><a href="https://github.com/SHADOW269/Keydir.in" target="_blank" rel="noopener"> _GitHub</a></li>
            <li><a href="https://github.com/SHADOW269/Keydir.in/issues" target="_blank" rel="noopener"> _Report Issue</a></li>
            <li><a href="https://keydir.in/terms-and-conditions/">_Terms &amp; Conditions</a></li>
          </ul>
        </div>
      </div>

      <div className="f-bottom">
        <div className="f-copy">
          © 2026 KEYDIR.in // COMMUNITY PROJECT // NOT AFFILIATED WITH ANY VENDOR // SYSTEM_END
        </div>
        <FooterThemeToggle />
      </div>
      <div className="f-watermark">KEYDIR</div>
    </footer>
  );
}
