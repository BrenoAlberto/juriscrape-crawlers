import { Page } from "puppeteer"
import { CourtCrawler } from "../../court/crawler";
import { FirstDegreeSearchPage } from "./search.page";
import { FirstDegreeCasePage } from "./case.page";
import { PreloadedFirstDegreePageManager } from "../../pageManager/preloadedFirstDegreePageManager";

export class FirstDegreeCaseCrawler implements CourtCrawler {
    private firstDegreeSearchPage: FirstDegreeSearchPage | undefined;
    private firstDegreeCasePage: FirstDegreeCasePage | undefined;
    private page: Page | undefined;

    private constructor(
        private readonly pageManager: PreloadedFirstDegreePageManager,
        private readonly court: "TJAL" | "TJCE",
    ) { }

    public async scrapeCase(caseNumber: string, processNumber: string, originNumber: string): Promise<any> {
        this.ensurePageIsInitialized();
        await this.firstDegreeSearchPage!.goToCase(processNumber, originNumber, this.court);
        const caseData = await this.firstDegreeCasePage!.fetchCaseData(caseNumber);
        console.log(caseData)

        this.releasePage();
        // ...
    }

    public static async create(pageManager: PreloadedFirstDegreePageManager, court: "TJAL" | "TJCE"): Promise<FirstDegreeCaseCrawler> {
        const crawler = new FirstDegreeCaseCrawler(pageManager, court);
        await crawler.init();
        return crawler;
    }

    private async init() {
        this.page = await this.pageManager.acquirePage(this.court);
        this.firstDegreeSearchPage = new FirstDegreeSearchPage(this.page);
        this.firstDegreeCasePage = new FirstDegreeCasePage(this.page)
    }

    private releasePage() {
        this.pageManager.releasePage(this.page!, this.court);
        this.page = undefined;
    }

    private ensurePageIsInitialized() {
        if (!this.page) {
            throw new Error("FirstDegreeCaseCrawler instance is not initialized. Call init before using it.");
        }
    }
}

// (
//     async () => {
//         const browser = await puppeteer.launch({ headless: false });
//         const pageManager = new PreloadedFirstDegreePageManager(browser);
//         const crawler = await FirstDegreeCaseCrawler.create(pageManager);
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