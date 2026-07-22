'use client';

import { ToastProvider } from './toast';

export function BannerToastWrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
