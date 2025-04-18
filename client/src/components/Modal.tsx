import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: { name: string; description: string; leads: string[] } | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, campaign }) => {
  if (!isOpen || !campaign) return null; // Don't render modal if it's not open or campaign is null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Campaign: {campaign.name}</h3>
          <button onClick={onClose} className="text-red-500">&times;</button>
        </div>
        <div className="mt-4">
          <p><strong>Description:</strong> {campaign.description}</p>
          <h4 className="mt-4 font-semibold">Leads:</h4>
          <ul className="list-disc pl-5">
            {campaign.leads.map((lead, index) => (
              <li key={index} className="text-sm">{lead}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Modal;
