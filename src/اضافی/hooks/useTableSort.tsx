// hooks/useTableSort.ts
import { useState, useCallback } from 'react';

export function useTableSort({ defaultField }: { defaultField: string }) {
  const [sortField, setSortField] = useState<string>(defaultField);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSort = useCallback((field: string) => {
    setSortField(prev => {
      if (prev === field) {
        setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortOrder('asc');
      return field;
    });
  }, []);

  return { sortField, sortOrder, toggleSort };
}