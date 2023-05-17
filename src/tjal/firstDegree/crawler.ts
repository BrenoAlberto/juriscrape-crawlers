import { Page } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { TJALFirstDegreeSearchPage } from "./search.page";
import { TJALFirstDegreeCasePage } from "./case.page";
import { PreloadedFirstDegreePageManager } from "../../pageManager/preloadedFirstDegreePageManager";

export class TJALFirstDegreeCaseCrawler implements CourtCrawler {
    private tjalFirstDegreeSearchPage: TJALFirstDegreeSearchPage | undefined;
    private tjalFirstDegreeCasePage: TJALFirstDegreeCasePage | undefined;
    private page: Page | undefined;

    private constructor(private readonly pageManager: PreloadedFirstDegreePageManager) { }

    private async init() {
        this.page = await this.pageManager.acquirePage();
        this.tjalFirstDegreeSearchPage = new TJALFirstDegreeSearchPage(this.page);
        this.tjalFirstDegreeCasePage = new TJALFirstDegreeCasePage(this.page)
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

    public async scrapeCase(caseNumber: string, processNumber: string, originNumber: string): Promise<any> {
        this.ensurePageIsInitialized();
        await this.tjalFirstDegreeSearchPage!.goToCase(processNumber, originNumber);
        const caseData = await this.tjalFirstDegreeCasePage!.fetchCaseData();
        console.log(caseData)

        this.releasePage();
        // ...
    }

    static async create(pageManager: PreloadedFirstDegreePageManager): Promise<TJALFirstDegreeCaseCrawler> {
        const crawler = new TJALFirstDegreeCaseCrawler(pageManager);
        await crawler.init();
        return crawler;
    }
}
