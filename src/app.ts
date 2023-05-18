import puppeteer from "puppeteer";
import { CourtCaseProcessor } from "./caseProcessor/caseProcessor";
import { PageManager } from "./pageManager/pageManager";
import { PreloadedFirstDegreePageManager } from "./pageManager/preloadedFirstDegreePageManager";

(async () => {

    const browser = await puppeteer.launch({
        headless: "new",
        // headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });

    const pageManager = new PageManager(browser);
    const preloadedFirstDegreePageManager = new PreloadedFirstDegreePageManager(browser)

    const courtCaseProcessor = new CourtCaseProcessor(pageManager, preloadedFirstDegreePageManager);
    await courtCaseProcessor.startProcessing();

})();