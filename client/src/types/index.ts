export enum CampaignStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DELETED = 'DELETED'
  }
  
  export interface Campaign {
    _id?: string;
    name: string;
    description: string;
    status: CampaignStatus;
    leads: string[];
    accountIDs: string[];
    createdAt?: string;
    updatedAt?: string;
  }
  
export interface LinkedInProfileData {
    _id?: string;
    name: string;
    jobTitle: string;
    company: string;
    location: string;
    profileUrl: string;
    scrapedAt?: string;
    summary?: string; // Optional, as scraper doesn't fetch it
  }