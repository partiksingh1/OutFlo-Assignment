import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Campaign, CampaignStatus } from '../types';
import { getCampaignById, createCampaign, updateCampaign } from '../services/api';
import axios from 'axios';

interface LinkedInProfile {
  _id: string;
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  profileUrl: string;
  scrapedAt: string;
}

interface CampaignFormProps {
  isEditing?: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Campaign>({
    name: '',
    description: '',
    status: CampaignStatus.ACTIVE,
    leads: [],
    accountIDs: []
  });

  const [leadsInput, setLeadsInput] = useState<string>('');
  const [accountIDsInput, setAccountIDsInput] = useState<string>('');
  const [profiles, setProfiles] = useState<LinkedInProfile[]>([]); // Fetched LinkedIn profiles
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]); // Track selected profiles
  const [searchQuery, setSearchQuery] = useState<string>(''); // For search input
  const [currentPage, setCurrentPage] = useState<number>(1); // For pagination
  const profilesPerPage = 10; // Number of profiles per page

  useEffect(() => {
    const fetchCampaign = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const campaign = await getCampaignById(id);
          setFormData(campaign);
          setLeadsInput(campaign.leads.join(', '));
          setAccountIDsInput(campaign.accountIDs.join(', '));
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch campaign');
          setLoading(false);
        }
      }
    };

    fetchCampaign();
  }, [isEditing, id]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.VITE_URL}/scrape/profiles`);
        setProfiles(response.data); // Assuming response is an array of LinkedIn profiles
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch LinkedIn profiles');
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLeadsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLeadsInput(e.target.value);
  };

  const handleAccountIDsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAccountIDsInput(e.target.value);
  };

  const handleProfileSelect = (profileUrl: string) => {
    setSelectedProfiles((prev) => {
      if (prev.includes(profileUrl)) {
        return prev.filter((url) => url !== profileUrl); // Deselect if already selected
      } else {
        return [...prev, profileUrl]; // Select profile
      }
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); // Update the search query
    setCurrentPage(1); // Reset to first page when search query changes
  };

  const filteredProfiles = profiles.filter((profile) => {
    return profile.profileUrl.toLowerCase().includes(searchQuery.toLowerCase()) || 
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      profile.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.company.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination: Slice the filtered profiles array based on current page
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = filteredProfiles.slice(indexOfFirstProfile, indexOfLastProfile);

  const handleNextPage = () => {
    if (currentPage * profilesPerPage < filteredProfiles.length) {
      setCurrentPage(currentPage + 1); // Move to the next page
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1); // Go back to the previous page
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Process leads and accountIDs from comma-separated strings
      const processedFormData = {
        ...formData,
        leads: [...new Set([...formData.leads, ...selectedProfiles])], // Merge manually added and selected profiles
        accountIDs: accountIDsInput.split(',').map(id => id.trim()).filter(Boolean)
      };
      
      if (isEditing && id) {
        await updateCampaign(id, processedFormData);
      } else {
        await createCampaign(processedFormData);
      }
      
      navigate('/');
    } catch (err) {
      setError(isEditing ? 'Failed to update campaign' : 'Failed to create campaign');
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="text-center py-8">Loading campaign...</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-6 text-center">{isEditing ? 'Edit Campaign' : 'Create Campaign'}</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Campaign Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label htmlFor="status" className="block text-gray-700 font-medium mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={CampaignStatus.ACTIVE}>ACTIVE</option>
            <option value={CampaignStatus.INACTIVE}>INACTIVE</option>
            <option value={CampaignStatus.DELETED}>DELETE</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="leads" className="block text-gray-700 font-medium mb-2">
            LinkedIn Leads (comma-separated URLs)
          </label>
          <textarea
            id="leads"
            name="leads"
            value={leadsInput}
            onChange={handleLeadsChange}
            rows={3}
            placeholder="https://linkedin.com/in/profile-1, https://linkedin.com/in/profile-2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* LinkedIn Profiles Fetched from Backend with Search */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select LinkedIn Profiles
          </label>
          <input
            type="text"
            placeholder="Search LinkedIn Profiles"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="space-y-2">
            {currentProfiles.map((profile) => (
              <div key={profile._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedProfiles.includes(profile.profileUrl)}
                  onChange={() => handleProfileSelect(profile.profileUrl)}
                  className="h-4 w-4"
                />
                <span>{profile.profileUrl}</span>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage * profilesPerPage >= filteredProfiles.length}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="accountIDs" className="block text-gray-700 font-medium mb-2">
            Account IDs (comma-separated)
          </label>
          <textarea
            id="accountIDs"
            name="accountIDs"
            value={accountIDsInput}
            onChange={handleAccountIDsChange}
            rows={2}
            placeholder="123, 456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <div className="flex items-center justify-between space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
