import mongoose, { Document, Schema } from 'mongoose';

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED'
}

export interface ICampaign extends Document {
  name: string;
  description: string;
  status: CampaignStatus;
  leads: string[];
  accountIDs: mongoose.Types.ObjectId[];
}

const CampaignSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: Object.values(CampaignStatus), 
    default: CampaignStatus.ACTIVE 
  },
  leads: { type: [String], default: [] },
  accountIDs: { type: [Schema.Types.ObjectId], default: [] }
}, { timestamps: true });

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);