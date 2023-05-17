import puppeteer, { Browser, Page } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { CourtCaseModel } from "../../court/model";
import { TJALSecondDegreeCasePage } from "./case.page";
import { TJALSecondDegreeSearchPage } from "./search.page";
import { PageManager } from "../../pageManager/pageManager";

class TJALSecondDegreeCaseCrawler implements CourtCrawler {
    private tjalSecondDegreeSearchPage: TJALSecondDegreeSearchPage | undefined;
    private tjalSecondDegreeCasePage: TJALSecondDegreeCasePage | undefined;
    private page: Page | undefined;

    private constructor(private readonly pageManager: PageManager) { }

    private async init() {
        this.page = await this.pageManager.acquirePage();
        this.tjalSecondDegreeSearchPage = new TJALSecondDegreeSearchPage(this.page);
        this.tjalSecondDegreeCasePage = new TJALSecondDegreeCasePage(this.page)
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
        console.log(caseData)
        this.pageManager.releasePage(this.page!);
        // ...
    }

    static async create(pageManager: PageManager): Promise<TJALSecondDegreeCaseCrawler> {
        const crawler = new TJALSecondDegreeCaseCrawler(pageManager);
        await crawler.init();
        return crawler;
    }
}
// (
//     async () => {
//         const browser = await puppeteer.launch({ headless: false });
//         const pageManager = new PageManager(browser);
//         const crawler = await TJALSecondDegreeCaseCrawler.create(pageManager);
//         const courtCase = "0710802-55.2018.8.02.0001"
//         const processNumber = "0710802-55.2018"
//         const start = performance.now();
//         await crawler.scrapeCase(courtCase, processNumber);
//         const end = performance.now();
//         console.log(`Time elapsed: ${(end - start) / 1000} seconds`);
//         await browser.close();
//     }
// )()