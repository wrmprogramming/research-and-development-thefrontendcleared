// src/core/interfaces/IGenericService.ts

import type { IBaseModel } from '../../types';

export interface IGenericService<T extends IBaseModel = any> {
  getAll(params?: Record<string, any>): Promise<T[]>;
  getById(id: number): Promise<T>;
  create(data: any, onProgress?: (p: number) => void): Promise<T>;
  update(id: number, data: any, onProgress?: (p: number) => void): Promise<T>;
  delete(id: number): Promise<void>;
  refetch(): Promise<void>;
}

export interface IHookService<T extends IBaseModel = any> {
  useItems: (params?: Record<string, any>) => {
    data: T[];
    isLoading: boolean;
    isFetching: boolean;
  };
  useItem: (id: number) => {
    data: T | null;
    isLoading: boolean;
  };
  create: (data: any, onProgress?: (p: number) => void) => Promise<T>;
  update: (id: number, data: any, onProgress?: (p: number) => void) => Promise<T>;
  delete: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export type ServiceToHook<T extends IGenericService> = IHookService<
  Awaited<ReturnType<T['getAll']>>[number]
>;
