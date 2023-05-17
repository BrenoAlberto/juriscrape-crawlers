import { Page } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { TJALSecondDegreeCasePage } from "./case.page";
import { TJALSecondDegreeSearchPage } from "./search.page";
import { PageManager } from "../../pageManager/pageManager";

export class TJALSecondDegreeCaseCrawler implements CourtCrawler {
    private tjalSecondDegreeSearchPage: TJALSecondDegreeSearchPage | undefined;
    private tjalSecondDegreeCasePage: TJALSecondDegreeCasePage | undefined;
    private page: Page | undefined;

    private constructor(private readonly pageManager: PageManager) { }

    private async init() {
        this.page = await this.pageManager.acquirePage();
        this.tjalSecondDegreeSearchPage = new TJALSecondDegreeSearchPage(this.page);
        this.tjalSecondDegreeCasePage = new TJALSecondDegreeCasePage(this.page)
    }

    private releasePage() {
        this.pageManager.releasePage(this.page!);
        this.page = undefined;
    }

    private ensurePageIsInitialized() {
        if (!this.page) {
            throw new Error("TJALCrawler instance is not initialized. Call init before using it.");
        }
    }

    public async scrapeCase(caseNumber: string, processNumber: string): Promise<any> {
        this.ensurePageIsInitialized();
        const caseURL = await this.tjalSecondDegreeSearchPage!.fetchCaseURL(caseNumber, processNumber);
        const caseData = await this.tjalSecondDegreeCasePage!.fetchCaseData(caseURL);
        console.log(caseData)
        this.releasePage();
    }

    static async create(pageManager: PageManager): Promise<TJALSecondDegreeCaseCrawler> {
        const crawler = new TJALSecondDegreeCaseCrawler(pageManager);
        await crawler.init();
        return crawler;
    }
}
