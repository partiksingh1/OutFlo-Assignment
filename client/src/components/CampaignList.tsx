import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Campaign, CampaignStatus } from '../types';
import { getCampaigns, updateCampaign, deleteCampaign } from '../services/api';
import Modal from './Modal'; // Import Modal component

const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null); // State to store selected campaign
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal visibility state

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch campaigns');
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleStatusToggle = async (campaign: Campaign) => {
    try {
      const newStatus = campaign.status === CampaignStatus.ACTIVE 
        ? CampaignStatus.INACTIVE 
        : CampaignStatus.ACTIVE;
      
      const updatedCampaign = await updateCampaign(campaign._id!, { status: newStatus });
      
      setCampaigns(campaigns.map(c => 
        c._id === campaign._id ? updatedCampaign : c
      ));
    } catch (err) {
      setError('Failed to update campaign status');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        setCampaigns(campaigns.filter(c => c._id !== id));
      } catch (err) {
        setError('Failed to delete campaign');
      }
    }
  };

  const openModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  if (loading) return <div className="text-center py-8">Loading campaigns...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="container mx-auto py-6 px-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Campaigns</h2>
        <Link 
          to="/campaigns/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Campaign
        </Link>
      </div>
      
      {campaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No campaigns found. Create your first campaign!
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider hidden md:table-cell">Leads</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm">{campaign.name}</td>
                  <td className="py-4 px-6 text-sm hidden sm:table-cell">{campaign.description}</td>
                  <td className="py-4 px-6 text-sm">
                    <button
                      onClick={() => handleStatusToggle(campaign)}
                      className={`px-3 py-1 rounded text-white ${
                        campaign.status === CampaignStatus.ACTIVE
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      {campaign.status}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-sm hidden md:table-cell">{campaign.leads.length}</td>
                  <td className="flex py-4 px-6 text-sm space-x-2">
                    <Link
                      to={`/campaigns/edit/${campaign._id}`}
                      className="flex text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteCampaign(campaign._id!)}
                      className="flex text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => openModal(campaign)}
                      className="flex text-green-600 hover:underline"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for displaying campaign details */}
      {selectedCampaign && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          campaign={selectedCampaign} 
        />
      )}
    </div>
  );
};

export default CampaignList;
