import { Browser, Page } from "puppeteer";

export class PageManager {
    private pages: Page[] = [];
    private readonly poolSize: number;

    constructor(private readonly puppeeterBrowser: Browser, poolSize = 5) {
        this.poolSize = poolSize;
        this.init();
    }

    private async init() {
        const promises: Promise<Page>[] = [];
        for (let i = 0; i < this.poolSize; i++) {
            promises.push(this.createNewPage());
        }
        const newPages = await Promise.all(promises);
        this.pages = newPages;
    }

    private async createNewPage() {
        const newBrowserContext = await this.puppeeterBrowser.createIncognitoBrowserContext();
        return newBrowserContext.newPage();
    }

    async acquirePage(): Promise<Page> {
        if (this.pages.length === 0) {
            return this.createNewPage();
        } else {
            return this.pages.pop()!;
        }
    }

    async releasePage(page: Page) {
        await page.close();
        const newPage = await this.createNewPage();
        this.pages.push(newPage);
    }
}
