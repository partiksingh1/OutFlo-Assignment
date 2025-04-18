import React from 'react';
import CampaignForm from '../components/CampaignForm';

const CreateCampaign: React.FC = () => {
  return (
    <div className="container mx-auto">
      <CampaignForm isEditing={false} />
    </div>
  );
};

export default CreateCampaign;