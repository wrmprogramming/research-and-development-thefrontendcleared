// hooks/useTableSearch.ts
import { useState, useCallback, useMemo } from 'react';

export function useTableSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  debounceTime = 300
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    const timer = setTimeout(() => setDebouncedTerm(term), debounceTime);
    return () => clearTimeout(timer);
  }, [debounceTime]);

  const filteredData = useMemo(() => {
    if (!debouncedTerm) return data;
    const lowerTerm = debouncedTerm.toLowerCase().trim();
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerTerm);
        }
        if (typeof value === 'number') {
          return String(value).includes(lowerTerm);
        }
        return false;
      });
    });
  }, [data, debouncedTerm, searchFields]);

  return { searchTerm, setSearchTerm: handleSearch, filteredData };
}