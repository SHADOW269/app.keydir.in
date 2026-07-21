'use client';

import { useState } from 'react';
import { testVendorScraper } from '@/lib/admin/scraper-actions';
import type { ScrapeResult } from '@/lib/scraper/types';

export function useScraperTest(vendorId: string) {
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<ScrapeResult | null>(null);
  const [testing, setTesting] = useState(false);

  async function handleTest() {
    if (!testUrl) return;
    setTesting(true);
    setTestResult(null);
    const result = await testVendorScraper(vendorId, testUrl);
    setTestResult(result);
    setTesting(false);
  }

  return { testUrl, setTestUrl, testResult, testing, handleTest };
}
