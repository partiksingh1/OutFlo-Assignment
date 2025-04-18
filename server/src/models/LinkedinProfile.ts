import mongoose from 'mongoose';

// LinkedIn Profile Schema
interface LinkedInProfile {
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  profileUrl: string;
  scrapedAt: Date;
}

export const LinkedInProfileSchema = new mongoose.Schema<LinkedInProfile>({
  name: { type: String, required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  profileUrl: { type: String, required: false, unique: false },
  scrapedAt: { type: Date, default: Date.now }
});

export const LinkedInProfile = mongoose.model<LinkedInProfile>('LinkedInProfile', LinkedInProfileSchema);