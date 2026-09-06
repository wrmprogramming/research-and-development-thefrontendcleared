// src/modules/university/index.ts
export * from './types/university.types';
export { universityApi } from './api/university.api';
export { useUniversity } from './hooks/useUniversity';
export {
  UniversitySelect,
  UniversityForm,
  UniversityList,
  UniversityTreeList,
} from './components';
