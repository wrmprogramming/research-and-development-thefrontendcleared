// src/pages/CityTreeManagement.tsx

import React from 'react';
import { GenericPage } from '../components/generic/GenericPage';
import { cityTreePageConfig } from '../configs/pageConfigs';
import '../styles/pages/city-tree.css';
const CityTreeManagement: React.FC = () => {
  return (
    <div className="city-tree-management">
      <GenericPage config={cityTreePageConfig} />
    </div>
  );
};

export default CityTreeManagement;