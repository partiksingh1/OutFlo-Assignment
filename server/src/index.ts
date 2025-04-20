import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import campaignRoutes from './routes/campaignRoutes';
import messageRoutes from './routes/messageRoutes';
import linkedInProfileRoutes from './routes/scrapingRoutes'
import scrapingRoutes from './routes/scrapingRoutes'
import axios from 'axios';
const PORT = process.env.PORT || 3000;
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.DATABASE_URL as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/personalized-message', messageRoutes);
app.use('/api/v1/linkedin-profiles', linkedInProfileRoutes);
app.use('/api/v1/scrape', scrapingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const keepServerAlive = () => {
  const url = 'https://outflo-assignment-ikng.onrender.com';

  setInterval(async () => {
    try {
      await axios.get(url);
      console.log(`Pinged the server at ${url} successfully.`);
    } catch (error) {
      console.error(`Failed to ping the server at ${url}:`);
    }
  }, 60000); // 60000 ms = 1 minute
};

// Start the keep-alive function
keepServerAlive();

export default app;