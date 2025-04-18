import { Request, Response } from 'express';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyDwCVW7DWdOs_UpNqhMEP-stIsTcfLDeLg" });

interface LinkedInProfile {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
}

export const generateMessage = async (req: Request, res: Response) => {
  try {
    const profile: LinkedInProfile = req.body;
    
    const prompt = `Generate a single, concise LinkedIn outreach message (2-3 sentences, no more) for ${profile.name}, a ${profile.job_title} at ${profile.company} in ${profile.location}. Their summary: ${profile.summary || 'Not provided'}. The message must be professional, friendly, invite connection, mention OutFlo's ability to automate outreach for meetings and sales, and exclude any conversational, instructional, explanatory text, or multiple options.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    const message = response.text
    res.json({ message });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate message' });
  }
};