import { Request, Response } from 'express';
import Campaign, { CampaignStatus } from '../models/Campaign';

// Get all campaigns that are not marked as DELETED
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find({ status: { $ne: CampaignStatus.DELETED } });
    if (!campaigns || campaigns.length === 0) {
       res.status(404).json({ message: 'No campaigns found' });
       return
    }
    res.json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err); // Log the error for debugging
    res.status(500).json({ message: 'Server error while fetching campaigns' });
  }
};

// Get a specific campaign by ID that is not marked as DELETED
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      status: { $ne: CampaignStatus.DELETED }
    });

    if (!campaign) {
       res.status(404).json({ message: 'Campaign not found' });
       return
    }
    
    res.json(campaign);
  } catch (err) {
    console.error('Error fetching campaign by ID:', err); // Log the error for debugging
    res.status(500).json({ message: 'Server error while fetching the campaign' });
  }
};

// Create a new campaign
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { name, description, leads = [], accountIDs = [] } = req.body;

    // Validate the input data
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
       res.status(400).json({ message: 'Campaign name is required and must be a valid string' });
       return
    }

    if (description && typeof description !== 'string') {
       res.status(400).json({ message: 'Campaign description must be a string' });
       return
    }

    const campaign = new Campaign({
      name,
      description,
      leads,
      accountIDs
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    console.error('Error creating campaign:', err); // Log the error for debugging
    res.status(400).json({ message: 'Invalid data provided for campaign creation' });
  }
};

// Update a campaign
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const { name, description, status, leads, accountIDs } = req.body;

    // Validate the status if provided
    if (status && !Object.values(CampaignStatus).includes(status)) {
      res.status(400).json({ message: 'Invalid status provided' });
      return
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, status: { $ne: CampaignStatus.DELETED } },
      { name, description, status, leads, accountIDs },
      { new: true }
    );

    if (!campaign) {
       res.status(404).json({ message: 'Campaign not found' });
       return
    }

    res.json(campaign);
  } catch (err) {
    console.error('Error updating campaign:', err); // Log the error for debugging
    res.status(400).json({ message: 'Invalid data provided for campaign update' });
  }
};

// Soft delete a campaign by updating its status to DELETED
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, status: { $ne: CampaignStatus.DELETED } },
      { status: CampaignStatus.DELETED },
      { new: true }
    );

    if (!campaign) {
       res.status(404).json({ message: 'Campaign not found' });
       return
    }

    res.json({ message: 'Campaign successfully deleted' });
  } catch (err) {
    console.error('Error deleting campaign:', err); // Log the error for debugging
    res.status(500).json({ message: 'Server error while deleting the campaign' });
  }
};