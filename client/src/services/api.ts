import axios from 'axios';
import { Campaign, LinkedInProfileData } from '../types';

const API_URL = `${process.env.VITE_URL}`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const searchLinkedInProfiles = async (query: string): Promise<LinkedInProfileData[]> => {
    const response = await api.get(`/linkedin-profiles/search?query=${encodeURIComponent(query)}`);
    return response.data;
  };
  
  export const getAllLinkedInProfiles = async (): Promise<LinkedInProfileData[]> => {
    const response = await api.get('/linkedin-profiles');
    return response.data;
  };

// Campaign API calls
export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get('/campaigns');
  return response.data;
};

export const getCampaignById = async (id: string): Promise<Campaign> => {
  const response = await api.get(`/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (campaign: Campaign): Promise<Campaign> => {
  const response = await api.post('/campaigns', campaign);
  return response.data;
};

export const updateCampaign = async (id: string, campaign: Partial<Campaign>): Promise<Campaign> => {
  const response = await api.put(`/campaigns/${id}`, campaign);
  return response.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await api.delete(`/campaigns/${id}`);
};

// LinkedIn Message API call
export const generatePersonalizedMessage = async (profile: LinkedInProfileData): Promise<string> => {
  const response = await api.post('/personalized-message', profile);
  return response.data.message;
};