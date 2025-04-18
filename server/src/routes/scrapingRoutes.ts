import express from 'express';
import { getProfiles, triggerScrape } from '../controllers/scrapingController';

const router = express.Router();

router.post('/scraping', triggerScrape);
router.get('/profiles', getProfiles);

export default router;