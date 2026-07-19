'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CompareHeader } from '@/components/compare/compare-header';
import { CompareContent } from '@/components/compare/compare-content';
import type { CompareProduct, SpecGroup } from '@/components/compare/compare-types';
import { syncCompareFromUrl, clearCompareOnUnmount } from '@/lib/compare-store';

interface Props {
  initialSlugs: string[];
  initialProducts: CompareProduct[];
  basePath: string;
  title: string;
  titleHighlight: string;
  categoryFilter: string;
  addLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
  maxMessage: string;
  noResultsMessage: string;
  specGroups: SpecGroup[];
  noSpecsMessage: string;
}

export function CompareClient({
  initialSlugs,
  initialProducts,
  basePath,
  title,
  titleHighlight,
  categoryFilter,
  addLabel,
  searchPlaceholder,
  emptyMessage,
  maxMessage,
  noResultsMessage,
  specGroups,
  noSpecsMessage,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    syncCompareFromUrl(categoryFilter, initialSlugs);
    return () => clearCompareOnUnmount();
  }, [categoryFilter, initialSlugs]);

  function updateUrl(slugs: string[]) {
    if (slugs.length === 0) {
      router.replace(basePath);
    } else {
      router.replace(`${basePath}?products=${slugs.join(',')}`);
    }
  }

  function handleAdd(slug: string) {
    const combined = [...initialSlugs, slug];
    if (combined.length > 4) return;
    updateUrl(combined);
  }

  function handleRemove(slug: string) {
    const combined = initialSlugs.filter((s) => s !== slug);
    updateUrl(combined);
  }

  function handleClear() {
    updateUrl([]);
  }

  return (
    <>
      <CompareHeader
        productSlugs={initialSlugs}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onClear={handleClear}
        title={title}
        titleHighlight={titleHighlight}
        categoryFilter={categoryFilter}
        addLabel={addLabel}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        maxMessage={maxMessage}
        noResultsMessage={noResultsMessage}
      />

      {initialProducts.length >= 1 && (
        <CompareContent
          products={initialProducts}
          onRemove={handleRemove}
          specGroups={specGroups}
          title={title}
          noSpecsMessage={noSpecsMessage}
        />
      )}
    </>
  );
}
