





import { Browser } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { CourtCaseModel } from "../../court/model";
import { TJALSecondDegreeCasePage } from "./case.page";
import { TJALSecondDegreeSearchPage } from "./search.page";

class TJALSecondDegreeCaseCrawler implements CourtCrawler {
    private tjalSecondDegreeSearchPage: TJALSecondDegreeSearchPage | undefined;
    private tjalSecondDegreeCasePage: TJALSecondDegreeCasePage | undefined;

    private constructor(private readonly puppeeterBrowser: Browser) { }

    private async init() {
        const newBrowserContext = await this.puppeeterBrowser.createIncognitoBrowserContext();
        const page = await newBrowserContext.newPage();
        this.tjalSecondDegreeSearchPage = new TJALSecondDegreeSearchPage(page);
        this.tjalSecondDegreeCasePage = new TJALSecondDegreeCasePage(page)
    }

    private ensurePageIsInitialized() {
        if (!this.tjalSecondDegreeSearchPage) {
            throw new Error("TJALCrawler instance is not initialized. Call init before using it.");
        }
    }

    public async scrapeCase(caseNumber: string, processNumber: string): Promise<any> {
        this.ensurePageIsInitialized();
        const caseURL = await this.tjalSecondDegreeSearchPage!.fetchCaseURL(caseNumber, processNumber);
        const caseData = await this.tjalSecondDegreeCasePage!.fetchCaseData(caseURL);


        // ...
    }

    static async create(puppeeterBrowser: Browser): Promise<TJALSecondDegreeCaseCrawler> {
        const crawler = new TJALSecondDegreeCaseCrawler(puppeeterBrowser);
        await crawler.init();
        return crawler;
    }
}
