import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LinkedInProfileData } from '../types';
import { generatePersonalizedMessage } from '../services/api';

const defaultProfile: LinkedInProfileData = {
  name: '',
  jobTitle: '',
  company: '',
  location: '',
  profileUrl: '',
  summary: '',
};

const MessageGenerator: React.FC = () => {
  const [profile, setProfile] = useState<LinkedInProfileData>(defaultProfile);
  const [profiles, setProfiles] = useState<LinkedInProfileData[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch profiles from backend on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_URL}/scrape/profiles`);
        setProfiles(response.data);
      } catch (err) {
        setFetchError('Failed to fetch profiles from database');
      }
    };
    fetchProfiles();
  }, []);

  // Handle profile selection from dropdown
  const handleProfileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = e.target.value;
    setSelectedProfileId(profileId);

    if (profileId === '') {
      setProfile(defaultProfile);
    } else {
      const selectedProfile = profiles.find((p) => p._id === profileId);
      if (selectedProfile) {
        setProfile({
          name: selectedProfile.name,
          jobTitle: selectedProfile.jobTitle,
          company: selectedProfile.company,
          location: selectedProfile.location,
          profileUrl: selectedProfile.profileUrl,
          summary: selectedProfile.summary || '', // Handle missing summary
        });
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle form submission to generate message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const generatedMessage = await generatePersonalizedMessage(profile);
      setMessage(generatedMessage);
    } catch (err) {
      setError('Failed to generate personalized message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-2">
      <h2 className="text-lg md:text-2xl font-bold mb-6">LinkedIn Personalized Message Generator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Input Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">LinkedIn Profile Information</h3>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {fetchError && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              {fetchError}
            </div>
          )}

          {/* Profile Selection Dropdown */}
          <div className="mb-4">
            <label htmlFor="profileSelect" className="block text-gray-700 font-medium mb-2">
              Select Profile
            </label>
            <select
              id="profileSelect"
              value={selectedProfileId}
              onChange={handleProfileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a profile or enter manually --</option>
              {profiles.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.jobTitle} at {p.company})
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="jobTitle" className="block text-gray-700 font-medium mb-2">
                Job Title*
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={profile.jobTitle}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="company" className="block text-gray-700 font-medium mb-2">
                Company*
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={profile.company}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={profile.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="summary" className="block text-gray-700 font-medium mb-2">
                Profile Summary
              </label>
              <textarea
                id="summary"
                name="summary"
                value={profile.summary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Message'}
            </button>
          </form>
        </div>

        {/* Generated Message Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Generated Message</h3>

          {message ? (
            <div className="border border-gray-300 rounded-md p-4 bg-gray-50 min-h-[200px]">
              <p className="whitespace-pre-wrap">{message}</p>
            </div>
          ) : (
            <div className="border border-gray-300 border-dashed rounded-md p-4 bg-gray-50 min-h-[200px] flex items-center justify-center text-gray-500">
              {loading ? 'Generating message...' : 'Select a profile or fill the form and click "Generate Message"'}
            </div>
          )}

          {message && (
            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(message);
                  alert('Message copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageGenerator;
