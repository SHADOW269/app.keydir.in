'use client';

import { useState } from 'react';

export function useFormSubmit() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<{ error?: string } | void>): Promise<boolean> {
    setPending(true);
    setError(null);
    const result = await fn();
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return false;
    }
    setPending(false);
    return true;
  }

  return { pending, error, setError, run };
}
