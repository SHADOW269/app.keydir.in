'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseScrollSpyOptions {
  sectionPrefix?: string;
  rootMargin?: string;
  threshold?: number;
}

export function useScrollSpy(sectionIds: string[], options: UseScrollSpyOptions = {}) {
  const { sectionPrefix = 'pe-section', rootMargin = '-20% 0px -60% 0px', threshold = 0 } = options;
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '');

  useEffect(() => {
    const sectionEls = sectionIds
      .map((id) => document.getElementById(`${sectionPrefix}-${id}`))
      .filter(Boolean) as HTMLElement[];
    if (!sectionEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace(`${sectionPrefix}-`, '');
          setActiveSection(id);
        }
      },
      { rootMargin, threshold }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds, sectionPrefix, rootMargin, threshold]);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(`${sectionPrefix}-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [sectionPrefix]);

  return { activeSection, scrollToSection };
}
