import { Browser, Page } from "puppeteer";

export class PreloadedFirstDegreePageManager {
    private preloadedFirstDegreePages: Page[] = [];
    private readonly poolSize: number;
    private readonly preloadFirstDegreeUrl = 'https://www2.tjal.jus.br/cpopg/open.do';

    constructor(private readonly puppeeterBrowser: Browser, poolSize = 5) {
        this.poolSize = poolSize;
        this.init();
    }

    private async init() {
        const promises: Promise<Page>[] = [];
        for (let i = 0; i < this.poolSize; i++) {
            promises.push(this.createPreloadedFirstDegreePage());
        }
        this.preloadedFirstDegreePages = await Promise.all(promises);
    }

    private async createNewPage() {
        const newBrowserContext = await this.puppeeterBrowser.createIncognitoBrowserContext();
        return newBrowserContext.newPage();
    }

    private async createPreloadedFirstDegreePage() {
        const newPage = await this.createNewPage();
        await newPage.goto(this.preloadFirstDegreeUrl);
        return newPage;
    }

    async acquirePage(): Promise<Page> {
        if (this.preloadedFirstDegreePages.length === 0) {
            return this.createNewPage();
        } else {
            return this.preloadedFirstDegreePages.pop()!;
        }
    }

    async releasePage(page: Page) {
        await page.close();
        const newPage = await this.createNewPage();
        this.preloadedFirstDegreePages.push(newPage);
    }
}
