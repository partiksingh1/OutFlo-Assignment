import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ScrapeForm from '../components/ScrapeForm';
import ProfileList from '../components/ProfileList';

interface LinkedInProfile {
  _id: string;
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  profileUrl: string;
  scrapedAt: string;
}

const ScrapePage: React.FC = () => {
  const [profiles, setProfiles] = useState<LinkedInProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL}/scrape/profiles`);
      setProfiles(response.data);
    } catch (err) {
      console.error('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return (
    <div className="p-6">
      <ScrapeForm onScrape={fetchProfiles} />
      {loading ? <p>Loading profiles...</p> : <ProfileList profiles={profiles} />}
    </div>
  );
};

export default ScrapePage;