// src/pages/Communication.tsx

import React from 'react';
import { GenericPage } from '../components/generic/GenericPage';
import { communicationPageConfig } from '../configs/pageConfigs';
import '../styles/pages/communication.css';

const CommunicationManagement: React.FC = () => {
  return (
    <div className="communication-management">
      <GenericPage config={communicationPageConfig} />
    </div>
  );
};

export default CommunicationManagement;