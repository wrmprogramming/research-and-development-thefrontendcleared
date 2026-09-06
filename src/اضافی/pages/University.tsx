// src/pages/UniversityTreeManagement.tsx

import React from 'react';
import { GenericPage } from '../components/generic/GenericPage';
import { universityTreePageConfig } from '../configs/pageConfigs';
import '../styles/pages/university-tree.css';

const UniversityTreeManagement: React.FC = () => {
  return (
    <div className="university-tree-management">
      <GenericPage config={universityTreePageConfig} />
    </div>
  );
};

export default UniversityTreeManagement;

// // src/pages/UniversityTreeManagement.tsx
// import React from 'react';
// import { GenericPage } from '../components/generic/GenericPage';
// import { universityTreePageConfig } from '../configs/pageConfi';
// import '../styles/pages/university-tree.css';

// const UniversityTreeManagement: React.FC = () => {
//   return (
//     <div className="university-tree-management">
//       <GenericPage config={universityTreePageConfig} />
//     </div>
//   );
// };

// export default UniversityTreeManagement;