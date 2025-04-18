import React from 'react';
import CampaignForm from '../components/CampaignForm';

const EditCampaign: React.FC = () => {
  return (
    <div className="container mx-auto">
      <CampaignForm isEditing={true} />
    </div>
  );
};

export default EditCampaign;