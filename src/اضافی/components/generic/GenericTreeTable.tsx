// components/generic/GenericTreeTable.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronLeft, Search, Plus, ChevronUp } from 'lucide-react';

export interface TreeNode<T = any> {
  id: number;
  name: string;
  data: T;
  children?: TreeNode<T>[];
  parentId?: number;
}

interface GenericTreeTableProps<T> {
  nodes: TreeNode<T>[];
  getChildren?: (node: TreeNode<T>) => Promise<TreeNode<T>[]> | TreeNode<T>[];
  renderRow: (node: TreeNode<T>, level: number) => React.ReactNode;
  renderActions?: (node: TreeNode<T>) => React.ReactNode;
  columns: { field: string; header: string; width?: number; sortable?: boolean }[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchPredicate?: (node: TreeNode<T>, searchTerm: string) => boolean;
  onNodeClick?: (node: TreeNode<T>) => void;
  onExpand?: (node: TreeNode<T>) => void;
  onAddRoot?: () => void;
  addRootLabel?: string;
}

export function GenericTreeTable<T>({
  nodes,
  getChildren,
  renderRow,
  renderActions,
  columns,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'جستجو...',
  searchPredicate,
  onNodeClick,
  onExpand,
  onAddRoot,
  addRootLabel,
}: GenericTreeTableProps<T>) {
  
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [childNodes, setChildNodes] = useState<Map<number, TreeNode<T>[]>>(new Map());

  const toggleNode = async (node: TreeNode<T>, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    const nodeId = node.id;
    const isExpanded = expandedNodes.has(nodeId);
    
    if (!isExpanded && getChildren && !childNodes.has(nodeId)) {
      const children = await getChildren(node);
      setChildNodes(prev => new Map(prev).set(nodeId, children));
    }
    
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    
    onExpand?.(node);
  };

  const filterNodes = useCallback((nodesToFilter: TreeNode<T>[], term: string): TreeNode<T>[] => {
    if (!term) return nodesToFilter;
    
    return nodesToFilter.filter(node => {
      let matches = false;
      if (searchPredicate) {
        matches = searchPredicate(node, term);
      } else {
        matches = node.name.toLowerCase().includes(term.toLowerCase());
      }
      
      if (matches) return true;
      
      const nodeChildren = childNodes.get(node.id) || node.children || [];
      const filteredChildren = filterNodes(nodeChildren, term);
      if (filteredChildren.length > 0) {
        setChildNodes(prev => new Map(prev).set(node.id, filteredChildren));
        return true;
      }
      
      return false;
    });
  }, [searchPredicate, childNodes]);

  const filteredNodes = useMemo(() => {
    if (!searchTerm) return nodes;
    return filterNodes(nodes, searchTerm);
  }, [nodes, searchTerm, filterNodes]);

  const renderNode = useCallback((node: TreeNode<T>, level: number): React.ReactNode => {
    const nodeId = node.id;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = (childNodes.get(nodeId) || node.children || []).length > 0;
    const nodeChildren = childNodes.get(nodeId) || node.children || [];
    
    return (
      <React.Fragment key={nodeId}>
        <tr 
          className={`tree-row level-${level}`}
          onMouseEnter={() => setHoveredNodeId(nodeId)}
          onMouseLeave={() => setHoveredNodeId(null)}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const isActionButton = target.closest('.action-btn') !== null;
            const isExpandButton = target.closest('.expand-btn') !== null;
            
            if (!isActionButton && !isExpandButton) {
              toggleNode(node);
              onNodeClick?.(node);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <td className="expand-cell" style={{ paddingRight: `${level * 20}px` }}>
            {hasChildren && (
              <button
                className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node);
                }}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </td>
          
          {columns.map((col) => (
            <td key={col.field} style={{ width: col.width }}>
              {renderRow(node, level)}
            </td>
          ))}
          
          {renderActions && (
            <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
              {renderActions(node)}
            </td>
          )}
        </tr>
        
        {isExpanded && hasChildren && (
          <>
            {nodeChildren.map(child => renderNode(child, level + 1))}
          </>
        )}
      </React.Fragment>
    );
  }, [expandedNodes, childNodes, columns, renderRow, renderActions, toggleNode, onNodeClick]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">در حال بارگذاری...</span>
        </div>
        <p className="mt-3 text-muted">در حال بارگذاری اطلاعات...</p>
      </div>
    );
  }

  return (
    <div className="generic-tree-table-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2">
          <button 
            onClick={() => setExpandedNodes(new Set(nodes.map(n => n.id)))}
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: '10px', padding: '6px 16px' }}
          >
            <ChevronDown size={14} className="me-1" />
            باز کردن همه
          </button>
          <button 
            onClick={() => setExpandedNodes(new Set())}
            className="btn btn-sm btn-outline-secondary"
            style={{ borderRadius: '10px', padding: '6px 16px' }}
          >
            <ChevronLeft size={14} className="me-1" />
            بستن همه
          </button>
          {onAddRoot && (
            <button 
              onClick={onAddRoot}
              className="btn btn-sm btn-success"
              style={{ borderRadius: '10px', padding: '6px 16px' }}
            >
              <Plus size={14} className="me-1" />
              {addRootLabel || 'افزودن جدید'}
            </button>
          )}
        </div>
        
        {searchable && (
          <div className="search-wrapper" style={{ position: 'relative', width: '300px' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', zIndex: 1 }} />
            <input
              type="text"
              className="form-control"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingRight: '40px', borderRadius: '25px', border: '1px solid #e0e0e0' }}
            />
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table className="generic-tree-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}></th>
              {columns.map(col => (
                <th key={col.field} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
              {renderActions && <th style={{ width: '120px' }} className="text-center">عملیات</th>}
            </tr>
          </thead>
          <tbody>
            {filteredNodes.map(node => renderNode(node, 0))}
            
            {filteredNodes.length === 0 && (
              <tr className="empty-state-row">
                <td colSpan={columns.length + 2} className="text-center py-5">
                  <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <h5 className="mt-3">هیچ داده‌ای یافت نشد</h5>
                    <p className="text-muted">موردی با عبارت جستجو شده پیدا نشد</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .generic-tree-table {
          width: 100%;
          border-collapse: collapse;
        }
        .generic-tree-table thead th {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          padding: 14px 16px;
          font-weight: 600;
          font-size: 14px;
          border-bottom: none;
          text-align: right;
        }
        .generic-tree-table tbody tr {
          transition: all 0.2s ease;
          border-bottom: 1px solid #f0f0f0;
        }
        .tree-row.level-0 {
          background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%);
        }
        .tree-row.level-1 {
          background-color: #ffffff;
        }
        .tree-row.level-2 {
          background-color: #fafbfd;
        }
        .tree-row:hover {
          background: linear-gradient(90deg, #e8f0fe 0%, #ffffff 100%);
        }
        .expand-cell {
          text-align: center;
          vertical-align: middle;
          padding: 12px 8px;
        }
        .expand-btn {
          width: 28px !important;
          height: 28px !important;
          border-radius: 8px !important;
          border: none !important;
          background: transparent !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          color: #6c757d !important;
        }
        .expand-btn:hover {
          background-color: #e9ecef !important;
          color: #0d6efd !important;
        }
        .expand-btn.expanded {
          background-color: #e9ecef !important;
          color: #0d6efd !important;
        }
        .actions-cell {
          text-align: center;
          padding: 8px;
        }
        .empty-state {
          text-align: center;
          padding: 20px;
        }
        .empty-icon {
          font-size: 48px;
          opacity: 0.5;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .tree-row {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
    </div>
  );
}

export default GenericTreeTable;
//