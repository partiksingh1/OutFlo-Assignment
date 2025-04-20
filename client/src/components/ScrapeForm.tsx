import React, { useState } from 'react';
import axios from 'axios';

interface ScrapeFormProps {
  onScrape: () => void;
}

const ScrapeForm: React.FC<ScrapeFormProps> = ({ onScrape }) => {
  const [searchUrl, setSearchUrl] = useState<string>(
    'https://www.linkedin.com/search/results/people/?geoUrn=%5B%22103644278%22%5D&industry=%5B%221594%22%2C%221862%22%2C%2280%22%5D&keywords=%22lead%20generation%20agency%22&origin=GLOBAL_SEARCH_HEADER&sid=z%40k&titleFreeText=Founder'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [numProfiles,setNumProfiles] = useState<number>(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${import.meta.env.VITE_URL}/scrape/scraping`, { searchUrl , numProfiles});
      onScrape(); // Refresh profile list
      alert('Scraping completed successfully!');
    } catch (err) {
      setError('Failed to scrape profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Scrape LinkedIn Profiles</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="searchUrl" className="block text-sm font-medium">
            LinkedIn Search URL
          </label>
          <input
            id="searchUrl"
            type="text"
            value={searchUrl}
            onChange={(e) => setSearchUrl(e.target.value)}
            className="mt-1 w-full p-2 border rounded"
            placeholder="Enter LinkedIn search URL"
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <input
            id="numProfile"
            type="number"
            value={numProfiles}
            onChange={(e) => setNumProfiles(parseInt(e.target.value))}
            className="mt-1 w-full p-2 border rounded"
            placeholder="Enter numbet of profiles to scrape"
            required
          />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Scraping...' : 'Start Scraping'}
        </button>
      </form>
    </div>
  );
};

export default ScrapeForm;