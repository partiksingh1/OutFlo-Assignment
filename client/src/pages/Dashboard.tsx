import React from 'react';
import CampaignList from '../components/CampaignList';

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto">
      <CampaignList />
    </div>
  );
};

export default Dashboard;