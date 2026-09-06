// src/modules/progress/index.ts

// ========== Types ==========
export type {
  Progress,
  ProgressFormData,
  ProgressStats,
  ProgressFilters,
  ProgressStatus,
  Contract,
  SteeringCommittee,
  YearStat,
  ContractStat,
} from './types/progress.types';

// ========== API ==========
export { progressApi } from './api/progress.api';

// ========== Hooks ==========
export { useProgress } from './hooks/useProgress';

// ========== Components ==========
export * from './components';
