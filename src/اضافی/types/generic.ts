// src/types/generic.ts

import { type ReactNode } from 'react';

export interface TableColumnConfig<T = any> {
  field: keyof T | string;
  header: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom' | 'file' | 'image' | 'badge';
  render?: (value: any, item: T) => ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'file' | 'email' | 'password' | 'checkbox';
  required?: boolean;
  colSize?: number;
  placeholder?: string;
  options?: Array<{ value: any; label: string }>;
  isSearchable?: boolean;
  accept?: string;
  help?: string;
  disabled?: boolean;
  defaultValue?: any;
  dependsOn?: string;
  addButton?: {
    label: string;
    onClick: () => void;
  };
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

//