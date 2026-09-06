// src/hooks/useSearchFilter.ts
import { useState, useMemo, useCallback } from 'react';

export interface SearchFilterConfig<T> {
  searchPredicate?: (item: T, searchTerm: string) => boolean;
  filters?: {
    key: string;
    label: string;
    options: { value: any; label: string }[];
    getValue: (item: T) => any;
  }[];
}

export interface SearchFilterResult<T> {
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  resetFilter: (key: string) => void;
  resetAllFilters: () => void;
  showFilters: boolean;
  toggleFilters: () => void;
  hasActiveFilters: boolean;
}

export function useSearchFilter<T>(
  data: T[],
  config: SearchFilterConfig<T>
): SearchFilterResult<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  // ========== تابع پیش‌فرض جستجو ==========
  const defaultSearchPredicate = (item: T, term: string): boolean => {
    const searchLower = term.toLowerCase();
    return Object.values(item as any).some(value => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      if (value && typeof value === 'object' && value.name) {
        return value.name.toLowerCase().includes(searchLower);
      }
      return false;
    });
  };

  const searchPredicate = config.searchPredicate || defaultSearchPredicate;

  // ========== بررسی اینکه گره با فیلترها مطابقت دارد ==========
  const nodeMatchesFilters = useCallback((node: any): boolean => {
    if (!config.filters || Object.keys(activeFilters).length === 0) {
      return true;
    }

    for (const filter of config.filters) {
      const filterValue = activeFilters[filter.key];
      if (filterValue !== undefined && filterValue !== null && filterValue !== 'all' && filterValue !== '') {
        const itemValue = filter.getValue(node);
        let matches = false;
        
        if (itemValue && typeof itemValue === 'object' && 'id' in itemValue) {
          matches = itemValue.id === filterValue;
        } else {
          matches = String(itemValue) === String(filterValue);
        }

        if (!matches) {
          return false;
        }
      }
    }

    return true;
  }, [activeFilters, config.filters]);

  // ========== فیلتر کردن درخت به صورت بازگشتی ==========
  const filterTree = useCallback((nodes: any[]): any[] => {
    if (!nodes || nodes.length === 0) return [];

    const result: any[] = [];

    for (const node of nodes) {
      // ۱. اول فرزندان را فیلتر می‌کنیم
      let filteredChildren: any[] = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = filterTree(node.children);
      }

      // ۲. بررسی می‌کنیم که آیا خود گره با فیلترها مطابقت دارد
      const nodePassesFilters = nodeMatchesFilters(node);

      // ۳. تصمیم می‌گیریم که گره را نگه داریم یا نه
      let shouldKeep = false;

      if (nodePassesFilters) {
        // اگر گره خودش فیلترها را پاس کرده باشد
        shouldKeep = true;
        result.push({
          ...node,
          children: node.children || []
        });
      } else if (filteredChildren.length > 0) {
        // اگر گره خودش فیلترها را پاس نکرده ولی فرزندانی دارد که پاس کرده‌اند
        shouldKeep = true;
        result.push({
          ...node,
          children: filteredChildren
        });
      }
    }

    return result;
  }, [nodeMatchesFilters]);

  // ========== اعمال جستجو روی داده‌ها (با پشتیبانی از درخت) ==========
  const applySearch = useCallback((items: T[]): T[] => {
    if (!searchTerm.trim()) return items;

    // تابع جستجوی بازگشتی در درخت
    const searchInTree = (nodes: any[]): any[] => {
      if (!nodes || nodes.length === 0) return [];

      const result: any[] = [];

      for (const node of nodes) {
        let filteredChildren: any[] = [];
        if (node.children && node.children.length > 0) {
          filteredChildren = searchInTree(node.children);
        }

        // بررسی اینکه آیا خود گره با جستجو مطابقت دارد
        const nodeMatches = searchPredicate(node, searchTerm);

        // اگر گره خودش مطابقت دارد یا فرزندانی دارد که مطابقت دارند، نگهش دار
        if (nodeMatches || filteredChildren.length > 0) {
          result.push({
            ...node,
            children: nodeMatches ? node.children : filteredChildren
          });
        }
      }

      return result;
    };

    // اگر داده‌ها ساختار درختی دارند (دارای children)، از جستجوی درختی استفاده کن
    if (items.length > 0 && 'children' in items[0]) {
      return searchInTree(items);
    }

    // در غیر این صورت جستجوی معمولی
    return items.filter(item => searchPredicate(item, searchTerm));
  }, [searchTerm, searchPredicate]);

  // ========== داده‌های نهایی ==========
  const filteredData = useMemo(() => {
    let filtered = data;
    
    // اگر داده‌ها ساختار درختی دارند و فیلتری فعال است
    if (data.length > 0 && 'children' in data[0]) {
      // ابتدا فیلترها را اعمال کن
      filtered = filterTree(data);
    } else if (Object.keys(activeFilters).length > 0) {
      // برای داده‌های غیردرختی، فیلترهای معمولی اعمال می‌شوند
      filtered = data.filter(item => {
        if (!config.filters) return true;
        
        for (const filter of config.filters) {
          const filterValue = activeFilters[filter.key];
          if (filterValue !== undefined && filterValue !== null && filterValue !== 'all' && filterValue !== '') {
            const itemValue = filter.getValue(item);
            let matches = false;
            
            if (itemValue && typeof itemValue === 'object' && 'id' in itemValue) {
              matches = itemValue.id === filterValue;
            } else {
              matches = String(itemValue) === String(filterValue);
            }

            if (!matches) {
              return false;
            }
          }
        }
        return true;
      });
    }

    // سپس جستجو را اعمال کن
    return applySearch(filtered);
  }, [data, filterTree, applySearch, activeFilters, config.filters]);

  // ========== توابع مدیریت فیلتر ==========
  const setFilter = useCallback((key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilter = useCallback((key: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const resetAllFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm('');
    setShowFilters(false);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(activeFilters).length > 0 || searchTerm.trim() !== '';
  }, [activeFilters, searchTerm]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    activeFilters,
    setFilter,
    resetFilter,
    resetAllFilters,
    showFilters,
    toggleFilters,
    hasActiveFilters,
  };
}


// // src/hooks/useSearchFilter.ts
// import { useState, useMemo, useCallback } from 'react';

// export interface SearchFilterConfig<T> {
//   searchPredicate?: (item: T, searchTerm: string) => boolean;
//   filters?: {
//     key: string;
//     label: string;
//     options: { value: any; label: string }[];
//     getValue: (item: T) => any;
//   }[];
// }

// export interface SearchFilterResult<T> {
//   filteredData: T[];
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
//   activeFilters: Record<string, any>;
//   setFilter: (key: string, value: any) => void;
//   resetFilter: (key: string) => void;
//   resetAllFilters: () => void;
//   showFilters: boolean;
//   toggleFilters: () => void;
//   hasActiveFilters: boolean;
// }

// export function useSearchFilter<T>(
//   data: T[],
//   config: SearchFilterConfig<T>
// ): SearchFilterResult<T> {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
//   const [showFilters, setShowFilters] = useState(false);

//   const defaultSearchPredicate = (item: T, term: string): boolean => {
//     const searchLower = term.toLowerCase();
//     return Object.values(item as any).some(value => {
//       if (typeof value === 'string') {
//         return value.toLowerCase().includes(searchLower);
//       }
//       if (value && typeof value === 'object' && value.name) {
//         return value.name.toLowerCase().includes(searchLower);
//       }
//       return false;
//     });
//   };

//   const searchPredicate = config.searchPredicate || defaultSearchPredicate;

//   // ========== بررسی اینکه گره دانشگاه با فیلترها مطابقت دارد ==========
//   const universityMatchesFilters = useCallback((node: any): boolean => {
//     if (!config.filters || Object.keys(activeFilters).length === 0) {
//       return true;
//     }

//     if (node.data?.type !== 'university') {
//       return true;
//     }

//     for (const filter of config.filters) {
//       const filterValue = activeFilters[filter.key];
//       if (filterValue !== undefined && filterValue !== null && filterValue !== 'all' && filterValue !== '') {
//         const itemValue = filter.getValue(node);
//         let matches = false;
        
//         if (itemValue && typeof itemValue === 'object' && 'id' in itemValue) {
//           matches = itemValue.id === filterValue;
//         } else {
//           matches = String(itemValue) === String(filterValue);
//         }

//         if (!matches) {
//           return false;
//         }
//       }
//     }

//     return true;
//   }, [activeFilters, config.filters]);

//   // ========== فیلتر کردن درخت به صورت بازگشتی ==========
//   const filterTree = useCallback((nodes: any[]): any[] => {
//     if (!nodes || nodes.length === 0) return [];

//     const result: any[] = [];

//     for (const node of nodes) {
//       let filteredChildren: any[] = [];
//       if (node.children && node.children.length > 0) {
//         filteredChildren = filterTree(node.children);
//       }

//       let shouldKeep = false;

//       if (node.data?.type === 'university') {
//         if (universityMatchesFilters(node)) {
//           shouldKeep = true;
//           result.push({
//             ...node,
//             children: node.children || []
//           });
//         }
//       } else {
//         if (filteredChildren.length > 0) {
//           shouldKeep = true;
//           result.push({
//             ...node,
//             children: filteredChildren
//           });
//         }
//       }
//     }

//     return result;
//   }, [universityMatchesFilters]);

//   // ========== اعمال جستجو ==========
//   const applySearch = useCallback((items: T[]): T[] => {
//     if (!searchTerm.trim()) return items;

//     const searchInTree = (nodes: any[]): any[] => {
//       if (!nodes || nodes.length === 0) return [];

//       const result: any[] = [];

//       for (const node of nodes) {
//         let filteredChildren: any[] = [];
//         if (node.children && node.children.length > 0) {
//           filteredChildren = searchInTree(node.children);
//         }

//         const nodeMatches = searchPredicate(node, searchTerm);

//         if (nodeMatches || filteredChildren.length > 0) {
//           result.push({
//             ...node,
//             children: nodeMatches ? node.children : filteredChildren
//           });
//         }
//       }

//       return result;
//     };

//     if (items.length > 0 && 'children' in items[0]) {
//       return searchInTree(items);
//     }

//     return items.filter(item => searchPredicate(item, searchTerm));
//   }, [searchTerm, searchPredicate]);

//   // ========== داده‌های نهایی ==========
//   const filteredData = useMemo(() => {
//     let filtered = data;
    
//     if (data.length > 0 && 'children' in data[0]) {
//       filtered = filterTree(data);
//     }

//     return applySearch(filtered);
//   }, [data, filterTree, applySearch]);

//   // ========== توابع مدیریت فیلتر ==========
//   const setFilter = useCallback((key: string, value: any) => {
//     setActiveFilters(prev => ({ ...prev, [key]: value }));
//   }, []);

//   const resetFilter = useCallback((key: string) => {
//     setActiveFilters(prev => {
//       const newFilters = { ...prev };
//       delete newFilters[key];
//       return newFilters;
//     });
//   }, []);

//   const resetAllFilters = useCallback(() => {
//     setActiveFilters({});
//     setSearchTerm('');
//     setShowFilters(false);
//   }, []);

//   const toggleFilters = useCallback(() => {
//     setShowFilters(prev => !prev);
//   }, []);

//   const hasActiveFilters = useMemo(() => {
//     return Object.keys(activeFilters).length > 0 || searchTerm.trim() !== '';
//   }, [activeFilters, searchTerm]);

//   return {
//     filteredData,
//     searchTerm,
//     setSearchTerm,
//     activeFilters,
//     setFilter,
//     resetFilter,
//     resetAllFilters,
//     showFilters,
//     toggleFilters,
//     hasActiveFilters,
//   };
// }
