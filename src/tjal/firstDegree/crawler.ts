





import axios from "axios"
import puppeteer, { Browser, Page } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { CourtCaseModel } from "../../court/model";
import { TJALFirstDegreeSearchPage } from "./search.page";

class TJALFirstDegreeCaseCrawler implements CourtCrawler {
    private tjalFirstDegreeInitialURL = "https://www2.tjal.jus.br/cpopg/open.do"
    private tjalFirstDegreePageObject: TJALFirstDegreeSearchPage | undefined;

    private constructor(private readonly puppeeterBrowser: Browser) { }

    private async initPageInNewBrowserContext() {
        const newBrowserContext = await this.puppeeterBrowser.createIncognitoBrowserContext();
        const page = await newBrowserContext.newPage();
        this.tjalFirstDegreePageObject = new TJALFirstDegreeSearchPage(page);
    }

    private ensurePageIsInitialized() {
        if (!this.tjalFirstDegreePageObject) {
            throw new Error("TJALCrawler instance is not initialized. Call init before using it.");
        }
    }

    public async scrapeCase(caseNumber: string): Promise<CourtCaseModel> {
        this.ensurePageIsInitialized();


        // ...
    }

    static async create(puppeeterBrowser: Browser): Promise<TJALFirstDegreeCaseCrawler> {
        const crawler = new TJALFirstDegreeCaseCrawler(puppeeterBrowser);
        await crawler.initPageInNewBrowserContext();
        return crawler;
    }
}

const puppeeterBrowser = await puppeteer.launch();

const tjalCrawler = await TJALFirstDegreeCaseCrawler.create(puppeeterBrowser);
// tjalCrawler.scrapeFirstDegreeCase