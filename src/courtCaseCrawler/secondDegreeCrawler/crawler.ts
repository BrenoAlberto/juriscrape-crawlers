import puppeteer, { Page } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { SecondDegreeCasePage } from "./case.page";
import { SecondDegreeSearchPage } from "./search.page";
import { PageManager } from "../../pageManager/pageManager";

export class SecondDegreeCaseCrawler implements CourtCrawler {
    private secondDegreeSearchPage: SecondDegreeSearchPage | undefined;
    private secondDegreeCasePage: SecondDegreeCasePage | undefined;
    private page: Page | undefined;

    private constructor(private readonly pageManager: PageManager) { }

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
        const caseURL = await this.secondDegreeSearchPage!.fetchCaseURL(caseNumber, processNumber);
        const caseData = await this.secondDegreeCasePage!.fetchCaseData(caseURL, caseNumber);
        console.log(caseData)
        this.releasePage();
    }

    public static async create(pageManager: PageManager): Promise<SecondDegreeCaseCrawler> {
        const crawler = new SecondDegreeCaseCrawler(pageManager);
        await crawler.init();
        return crawler;
    }
}
// (
//     async () => {
//         const browser = await puppeteer.launch({ headless: false });
//         const pageManager = new PageManager(browser);
//         const crawler = await SecondDegreeCaseCrawler.create(pageManager);
//         const courtCase = "0070337-91.2008.8.06.0001"
//         const processNumber = "0070337-91.2008"
//         const start = performance.now();
//         await crawler.scrapeCase(courtCase, processNumber);
//         const end = performance.now();
//         console.log(`Time elapsed: ${(end - start) / 1000} seconds`);
//         await browser.close();
//     }
// )()