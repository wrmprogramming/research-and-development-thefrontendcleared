// src/types/pageConfig.ts

import type { LucideIcon } from 'lucide-react';
import type { TableColumnConfig, FieldConfig } from './generic';

export type PageType = 'simple' | 'tree' | 'dashboard';

export interface StatConfig {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: Array<{ value: any; label: string }>;
}

export interface TreeLevelConfig {
  type: string;
  label: string;
  icon: LucideIcon;
}

export interface TreeRelationConfig {
  parent: string;
  child: string;
  foreignKey: string;
}

export interface TreeConfig {
  levels: TreeLevelConfig[];
  relations: TreeRelationConfig[];
}

export interface FormTypeConfig {
  type: string;
  title: string;
  fields: FieldConfig[];
  getInitialData?: (item: any) => Record<string, any>;
  onSubmit?: (data: any, item: any) => any;
}

export interface PageConfig<T = any> {
  type: PageType;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  columns?: TableColumnConfig<T>[];
  formFields: FieldConfig[];
  useHook: () => any;
  stats?: StatConfig[];
  searchFields?: string[];
  filterConfigs?: FilterConfig[];
  treeConfig?: TreeConfig;
  formTypes?: FormTypeConfig[];
  getItemType?: (item: any) => string;
}
//