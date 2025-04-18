import { chromium } from 'playwright';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { setTimeout } from 'timers/promises';
import { LinkedInProfile } from '../models/LinkedinProfile';

dotenv.config();

/**
 * Scrapes a specified number of unique LinkedIn profiles from a search URL
 */
async function scrapeLinkedInProfiles(searchUrl:string,numProfiles:number) {
  console.log("Starting scraper...");

  // Connect to MongoDB with retry logic
  let dbConnected = false;
  for (let i = 0; i < 3; i++) {
    try {
      console.log(`Connecting to MongoDB (attempt ${i + 1})...`);
      await mongoose.connect(process.env.DATABASE_URL as string);
      dbConnected = true;
      console.log('Connected to MongoDB');
      break;
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err);
      if (i < 2) await setTimeout(5000);
    }
  }

  if (!dbConnected) {
    console.error('Failed to connect to MongoDB after 3 attempts');
    process.exit(1);
  }

  // Configure browser
  const browser = await chromium.launch({
    headless: false, // Keep false for debugging
    slowMo: 150, // Increased for human-like behavior
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  });

  // Block unnecessary resources
  await context.route('**/*.{png,jpg,jpeg,svg,gif,webp,woff,woff2}', route => route.abort());
  
  const page = await context.newPage();

  try {
    // Navigate to LinkedIn login page
    console.log("Navigating to LinkedIn login page...");
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await setTimeout(3000 + Math.random() * 2000); // Random delay: 3–5s

    // Wait for login (manual login)
    console.log('Please log in manually within 60 seconds...');
    try {
      await Promise.race([
        page.waitForSelector('.global-nav__me', { timeout: 60000 }),
        page.waitForSelector('.search-global-typeahead__input', { timeout: 60000 })
      ]);
      console.log('Logged in successfully!');
      await setTimeout(2000 + Math.random() * 3000); // Random delay: 2–5s
    } catch (err) {
      console.warn('Login selector not found. Proceeding, but scraping may fail if not logged in.');
    }

    // Navigate to search results
    // const searchUrl = "https://www.linkedin.com/search/results/people/?industry=%5B%221594%22%2C%221862%22%2C%2280%22%5D&keywords=%22lead%20generation%20agency%22&origin=FACETED_SEARCH&sid=BxF&titleFreeText=Founder";
    console.log(`Navigating to search URL: ${searchUrl}`);

    // Retry loading search results up to 3 times
    let searchResultsLoaded = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Attempt ${attempt}: Loading search results...`);
      try {
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for search results with multiple fallback selectors
        await Promise.race([
          page.waitForSelector('.reusable-search__result-container', { timeout: 30000 }),
          page.waitForSelector('.search-results-container', { timeout: 30000 }),
          page.waitForSelector('.entity-result', { timeout: 30000 }),
          page.waitForSelector('a[href*="/in/"]', { timeout: 30000 })
        ]);
        console.log("Search results loaded successfully!");
        searchResultsLoaded = true;
        break;
      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err);
        if (attempt < 3) {
          console.log('Retrying after 5 seconds...');
          await setTimeout(5000);
        }
      }
    }

    if (!searchResultsLoaded) {
      console.error("Failed to load search results after 3 attempts.");
      await page.screenshot({ path: 'search-error-screenshot.png' });
      console.log('Saved screenshot to search-error-screenshot.png');
      throw new Error("Search results not found");
    }

    // Scroll to load more results with human-like behavior
    console.log("Scrolling to load more results...");
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2); // Scroll halfway
    });
    await setTimeout(2000 + Math.random() * 3000); // Random delay: 2–5s
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight); // Scroll to bottom
    });
    await setTimeout(5000 + Math.random() * 5000); // Random delay: 5–10s

    // Collect unique profile links by resolving redirects
// Collect unique profile links across multiple pages
let profileLinks: string[] = [];
const uniqueFinalUrls = new Set<string>();
console.log("Attempting to extract profile links...");

try {
  let currentPage = 1;
  const maxPages = 5; // Limit to 5 pages to avoid excessive scraping

  while (profileLinks.length < numProfiles && currentPage <= maxPages) {
    console.log(`Processing search results page ${currentPage}...`);

    // Construct search URL with page parameter
    const pageSearchUrl = `${searchUrl}${searchUrl.includes('?') ? '&' : '?'}page=${currentPage}`;
    console.log(`Navigating to: ${pageSearchUrl}`);
    await page.goto(pageSearchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for search results with multiple fallback selectors
    try {
      await Promise.race([
        page.waitForSelector('.reusable-search__result-container', { timeout: 30000 }),
        page.waitForSelector('.search-results-container', { timeout: 30000 }),
        page.waitForSelector('.entity-result', { timeout: 30000 }),
        page.waitForSelector('a[href*="/in/"]', { timeout: 30000 }),
      ]);
      console.log(`Search results loaded for page ${currentPage}`);
    } catch (err) {
      console.error(`Failed to load search results for page ${currentPage}:`, err);
      await page.screenshot({ path: `search-error-page-${currentPage}.png` });
      break;
    }

    // Scroll to load all results on the page
    console.log(`Scrolling page ${currentPage} to load more results...`);
    let previousHeight = await page.evaluate(() => document.body.scrollHeight);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await setTimeout(3000 + Math.random() * 3000); // Random delay: 3–6s
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      if (newHeight === previousHeight) break; // Stop if no more content loads
      previousHeight = newHeight;
    }

    // Extract potential profile links
    const potentialLinks = await page.$$eval(
      'a[href*="/in/"], a.app-aware-link[href*="/in/"], a.search-result__result-link[href*="/in/"], .entity-result__title-link[href*="/in/"], .entity-result__title-text a[href*="/in/"], .reusable-search__result-container a[href*="/in/"]',
      (links) =>
        links
          .map((link) => link.getAttribute('href'))
          .filter(
            (href): href is string =>
              !!href &&
              href.includes('/in/') &&
              !href.includes('/company/') &&
              !href.match(/\/in\/ACo[A-Za-z0-9_-]{10,}/)
          )
    );
    console.log(`Found ${potentialLinks.length} potential links on page ${currentPage}:`, potentialLinks);

    // Check each link for redirects
    for (const link of potentialLinks) {
      if (profileLinks.length >= numProfiles) break;

      try {
        console.log(`Checking URL: ${link}`);
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const finalUrl = page.url().split('?')[0].replace(/\/$/, '');
        console.log(`Final URL after redirect: ${finalUrl}`);

        // Skip if it’s a member ID or already included
        if (finalUrl.match(/\/in\/ACo[A-Za-z0-9_-]{10,}/)) {
          console.log(`Skipping member ID URL: ${finalUrl}`);
          continue;
        }
        if (uniqueFinalUrls.has(finalUrl)) {
          console.log(`Skipping duplicate final URL: ${finalUrl}`);
          continue;
        }

        // Add to lists
        uniqueFinalUrls.add(finalUrl);
        profileLinks.push(finalUrl);
        console.log(`Added unique profile link: ${finalUrl}`);

        // Random delay to mimic human behavior: 3–7s
        await setTimeout(3000 + Math.random() * 4000);
      } catch (err) {
        console.error(`Failed to check URL ${link}:`, err);
        continue;
      }
    }

    console.log(`Total unique profile links after page ${currentPage}: ${profileLinks.length}`);
    currentPage++;
    await setTimeout(5000 + Math.random() * 5000); // Random delay between pages: 5–10s
  }

  // Return to the first search page for scraping
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await setTimeout(3000 + Math.random() * 3000); // Random delay: 3–6s
} catch (err) {
  console.error("Failed to extract profile links:", err);
}

if (profileLinks.length === 0) {
  console.error("No unique profile links found after checking redirects.");
  await page.screenshot({ path: 'no-links-screenshot.png' });
  console.log('Saved screenshot to no-links-screenshot.png');
  throw new Error("No profile links extracted");
}

console.log(`Scraping ${profileLinks.length} unique profile links:`, profileLinks);

    // Track scraped URLs to avoid duplicates (fallback)
    const scrapedUrls = new Set<string>();

    // Scrape the specified number of profiles
    for (let i = 0; i < Math.min(profileLinks.length, numProfiles); i++) {
      let profileUrl = profileLinks[i];
      console.log(`[${i + 1}/${numProfiles}] Scraping: ${profileUrl}`);
      
      try {
        // Retry loading profile page up to 3 times
        let profileLoaded = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          console.log(`Attempt ${attempt}: Loading profile page...`);
          try {
            await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Double-check final URL
            const finalUrl = page.url().split('?')[0].replace(/\/$/, '');
            if (finalUrl !== profileUrl) {
              console.log(`Redirect detected: ${profileUrl} -> ${finalUrl}`);
              profileUrl = finalUrl;
            }

            // Skip if already scraped
            if (scrapedUrls.has(profileUrl)) {
              console.log(`Profile ${profileUrl} already scraped, skipping...`);
              break;
            }

            // Wait for profile data
            try {
              await page.waitForSelector('h1', { timeout: 30000 });
              console.log("Profile name (h1) found!");
              profileLoaded = true;
              break;
            } catch (err) {
              console.warn(`Selector wait failed, attempting to scrape without waiting...`);
              profileLoaded = true;
              break;
            }
          } catch (err) {
            console.error(`Attempt ${attempt} failed to load profile:`, err);
            if (attempt < 3) {
              console.log('Retrying after 5–10 seconds...');
              await setTimeout(5000 + Math.random() * 5000);
            }
          }
        }

        if (!profileLoaded) {
          throw new Error("Failed to load profile page after 3 retries");
        }

        // Skip if already scraped
        if (scrapedUrls.has(profileUrl)) {
          continue;
        }

        // Mark as scraped
        scrapedUrls.add(profileUrl);

        // Mimic human scrolling
        await page.evaluate(() => {
          window.scrollBy(0, 500); // Scroll a bit
        });
        await setTimeout(2000 + Math.random() * 3000); // Random delay: 2–5s

        // Additional delay for JavaScript rendering
        await setTimeout(3000 + Math.random() * 4000); // Random delay: 3–7s

        // Scrape profile data
        const profileData = await page.evaluate(() => {
          // Name
          const nameElement = (
            document.querySelector('h1') ||
            document.querySelector('.pv-text-details__left-column h1')
          );
          const name = nameElement?.textContent?.trim() || 'Unknown';
          
          // Job Title
          const jobTitleElement = (
            document.querySelector('.pv-text-details__title') ||
            document.querySelector('.text-body-medium') ||
            document.querySelector('.top-card-layout__headline') ||
            document.querySelector('div[class*="headline"]')
          );
          const jobTitle = jobTitleElement?.textContent?.trim() || 'Unknown';
          
          // Company
          const companyElement = (
            document.querySelector('span.t-14.t-normal:not([class*="pvs-entity__caption-wrapper"]):not([class*="location"])') ||
            document.querySelector('div[class*="pv-entity"] span:not([class*="pvs-entity__caption-wrapper"])') ||
            document.querySelector('.pv-entity__company-details span') ||
            document.querySelector('div[class*="experience"] span')
          );
          let company = companyElement?.textContent?.trim() || 'Unknown';
          if (company.includes('·')) {
            company = company.split('·')[0].trim();
          }
          company = [...new Set(company.split(/(?=[A-Z])/))].join('').replace(/(.)\1+/g, '$1').trim();
          
          // Location
          const locationElement = (
            document.querySelector('span.text-body-small.inline.t-black--light.break-words') ||
            document.querySelector('div[class*="pv-text-details"] span:not([class*="distance-badge"]):last-child') ||
            document.querySelector('.top-card-layout__entity-info span:not([class*="distance-badge"]):last-child') ||
            document.querySelector('span[class*="location"]')
          );
          const location = locationElement?.textContent?.trim() || 'Unknown';

          // Debug info
          const debugInfo = {
            nameFound: !!nameElement,
            jobTitleFound: !!jobTitleElement,
            companyFound: !!companyElement,
            locationFound: !!locationElement
          };

          return { name, jobTitle, company, location, debugInfo };
        });

        console.log("Scraped data:", profileData);
        console.log("Debug info:", profileData.debugInfo);

        // Save to MongoDB
        try {
          if (!profileUrl || profileUrl === 'null' || profileUrl.trim() === '') {
            throw new Error(`Invalid profileUrl: ${profileUrl}`);
          }
          const profile = new LinkedInProfile({
            name: profileData.name,
            jobTitle: profileData.jobTitle,
            company: profileData.company,
            location: profileData.location,
            profileUrl: profileUrl
          });
          
          await profile.save();
          console.log(`✅ Saved profile: ${profileData.name}`);
        } catch (saveError) {
          console.error('Failed to save profile:', saveError);
        }

        // Random delay between profiles: 5–10s
        await setTimeout(5000 + Math.random() * 5000);

      } catch (profileError) {
        console.error(`❌ Failed to scrape profile ${profileUrl}:`, profileError);
        continue;
      }
    }
    console.log('🎉 Scraping completed successfully!');
    return;
  } catch (error) {
    console.error('💥 Error during scraping:', error);
  } finally {
    console.log("Cleaning up...");
    await browser.close();
    console.log("Scraper finished.");
    return
  }
}

export default scrapeLinkedInProfiles;