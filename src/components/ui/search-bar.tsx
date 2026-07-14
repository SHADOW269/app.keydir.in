'use client';

import { useState, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (q: string) => void;
}

export function SearchBar({
  placeholder = 'Search products...',
  defaultValue = '',
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/keyboards?q=${encodeURIComponent(query)}`);
      }
    },
    [query, onSearch, router]
  );

  function handleClear() {
    setQuery('');
    inputRef.current?.focus();
    if (onSearch) {
      onSearch('');
    } else {
      router.push('/keyboards');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="search-wrap">
      <Search className="search-icon" size={18} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      <button
        type="button"
        className={`s-clear ${query ? 'show' : ''}`}
        onClick={handleClear}
        tabIndex={-1}
      >
        ×
      </button>
    </form>
  );
}
