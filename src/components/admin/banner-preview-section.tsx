'use client';

import { Card } from './admin-card';

interface Props {
  dev: 'd' | 'm';
  onDevChange: (d: 'd' | 'm') => void;
  preview: React.ReactNode;
  desktopImg: React.ReactNode;
  mobileImg: React.ReactNode;
  showDesktopWarn: boolean;
  showMobileWarn: boolean;
}

export function BannerPreviewSection({ dev, onDevChange, preview, desktopImg, mobileImg, showDesktopWarn, showMobileWarn }: Props) {
  return (
    <Card t="Live Preview">
      <div className="pv-tabs">
        <button type="button" onClick={() => onDevChange('d')} className={`pv-tab ${dev === 'd' ? 'on' : ''}`}>Desktop</button>
        <button type="button" onClick={() => onDevChange('m')} className={`pv-tab ${dev === 'm' ? 'on' : ''}`}>Mobile</button>
      </div>
      {preview}
      <div className="pv-sep" />
      <div className="pv-img-hd">Images</div>
      {desktopImg}
      {mobileImg}
      {showDesktopWarn && <span className="ce-warn">Desktop image needed</span>}
      {showMobileWarn && <span className="ce-warn">Mobile image needed</span>}
    </Card>
  );
}
