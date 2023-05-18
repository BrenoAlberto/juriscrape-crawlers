require('dotenv').config();

import puppeteer from "puppeteer";
import { CourtCaseProcessor } from "./caseProcessor/caseProcessor";
import { PageManager } from "./pageManager/pageManager";
import { PreloadedFirstDegreePageManager } from "./pageManager/preloadedFirstDegreePageManager";


import express from 'express';
import { CourtCaseCrawlerController } from "./courtCaseCrawler/controller";

const app = express();
app.use(express.json());

puppeteer.launch({
    headless: "new",
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
    ]
}).then(async browser => {
    const pageManager = await PageManager.create(browser);
    const preloadedFirstDegreePageManager = await PreloadedFirstDegreePageManager.create(browser)

    const courtCaseProcessor = new CourtCaseProcessor(pageManager, preloadedFirstDegreePageManager);
    courtCaseProcessor.startProcessing();

    const courtCaseCrawlerController = new CourtCaseCrawlerController(courtCaseProcessor);

    app.post('/crawl-court-cases', (req, res) => courtCaseCrawlerController.crawlCourtCases(req, res));

    app.listen(3008, () => console.log('Server is running on port 3008'));
})
