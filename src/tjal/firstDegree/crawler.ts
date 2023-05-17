import puppeteer, { Browser, Page } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { CourtCaseModel } from "../../court/model";
import { TJALFirstDegreeSearchPage } from "./search.page";
import { PageManager } from "../../pageManager/pageManager";
import { TJALFirstDegreeCasePage } from "./case.page";
import { PreloadedFirstDegreePageManager } from "../../pageManager/preloadedFirstDegreePageManager";

class TJALFirstDegreeCaseCrawler implements CourtCrawler {
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

        await new Promise(resolve => setTimeout(resolve, 20000));

        this.releasePage();
        // ...
    }

    static async create(pageManager: PreloadedFirstDegreePageManager): Promise<TJALFirstDegreeCaseCrawler> {
        const crawler = new TJALFirstDegreeCaseCrawler(pageManager);
        await crawler.init();
        return crawler;
    }
}

// (
//     async () => {
//         const browser = await puppeteer.launch({ headless: false });
//         const pageManager = new PreloadedFirstDegreePageManager(browser);
//         const crawler = await TJALFirstDegreeCaseCrawler.create(pageManager);
//         const courtCase = "0710802-55.2018.8.02.0001"
//         const processNumber = "0710802-55.2018"
//         const originNumber = "0001"
//         const start = performance.now();
//         await crawler.scrapeCase(courtCase, processNumber, originNumber);
//         const end = performance.now();
//         console.log(`Time elapsed: ${(end - start) / 1000} seconds`);
//         await browser.close();
//     }
// )()