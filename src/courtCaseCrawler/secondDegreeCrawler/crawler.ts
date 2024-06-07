import puppeteer, { Page } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { SecondDegreeCasePage } from "./case.page";
import { SecondDegreeSearchPage } from "./search.page";
import { PageManager } from "../../pageManager/pageManager";
import { Court } from "../../court/model";

export class SecondDegreeCaseCrawler implements CourtCrawler {
    private secondDegreeSearchPage: SecondDegreeSearchPage | undefined;
    private secondDegreeCasePage: SecondDegreeCasePage | undefined;
    private page: Page | undefined;

    private constructor(
        private readonly pageManager: PageManager,
        private readonly court: Court,
    ) { }

    private async init() {
        this.page = await this.pageManager.acquirePage();
        this.secondDegreeSearchPage = new SecondDegreeSearchPage(this.page);
        this.secondDegreeCasePage = new SecondDegreeCasePage(this.page)
    }

    private releasePage() {
        this.pageManager.releasePage(this.page!);
        this.page = undefined;
    }

    private ensurePageIsInitialized() {
        if (!this.page) {
            throw new Error("SecondDegreeCaseCrawler instance is not initialized. Call init before using it.");
        }
    }

    public async scrapeCase(caseNumber: string, processNumber: string): Promise<any> {
        this.ensurePageIsInitialized();
        const startPerf = performance.now();
        try {
            const caseURL = await this.secondDegreeSearchPage!.fetchCaseURL(caseNumber, processNumber, this.court);
            const caseData = await this.secondDegreeCasePage!.fetchCaseData(caseURL, caseNumber);
            const endPerf = performance.now();
            console.log(`Case ${caseNumber} took ${endPerf - startPerf} milliseconds to scrape.`);
            this.releasePage();
            return caseData;
        } catch (error) {
            const endPerf = performance.now();
            console.log(`Case ${processNumber} took ${endPerf - startPerf} milliseconds to scrape - NO DATA.`);
            this.releasePage();
        }
    }

    public static async create(pageManager: PageManager, court: Court): Promise<SecondDegreeCaseCrawler> {
        const crawler = new SecondDegreeCaseCrawler(pageManager, court);
        await crawler.init();
        return crawler;
    }
}