import { Request, Response } from 'express';
import scrapeLinkedInProfiles from '../service/linkedinScraper';
import { LinkedInProfile } from '../models/LinkedinProfile';

export const triggerScrape = async (req: Request, res: Response) => {
  const { searchUrl, numProfiles } = req.body;

  // Validate searchUrl
  if (!searchUrl || !searchUrl.includes('linkedin.com/search/results/people')) {
    res.status(400).json({ error: 'Valid LinkedIn search URL is required' });
    return
  }
  if (numProfiles <= 0 || numProfiles > 100) {
    res.status(400).json({ error: 'Number of profiles must be between 1 and 100' });
    return
  }

  try {
    // Trigger scraping
    console.log(`Scraping profiles from: ${searchUrl} for ${numProfiles} profiles.`);
    const profileUrls = await scrapeLinkedInProfiles(searchUrl,numProfiles);

    if (!searchUrl) {
       res.status(404).json({ error: 'No url found' });
       return
    }

    // Fetch scraped profiles from MongoDB
    const profiles = await LinkedInProfile.find({
      profileUrl: { $in: profileUrls },
    }).lean();

    res.status(200).json({
      message: 'Scraping completed successfully',
      profiles,
    });
  } catch (error) {
    console.error('Scrape error:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to scrape profiles. Please try again later.' });
  }
};

export const getProfiles = async (req: Request, res: Response) => {
  try {
    // Fetch profiles from MongoDB
    const profiles = await LinkedInProfile.find().lean();
    
    if (!profiles || profiles.length === 0) {
       res.status(404).json({ error: 'No profiles found' });
       return
    }

    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch profiles from the database' });
  }
};
