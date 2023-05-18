import { Browser, Page } from "puppeteer";

export class PageManager {
    private pages: Page[] = [];
    private readonly poolSize: number;

    constructor(private readonly puppeeterBrowser: Browser, poolSize = 3) {
        this.poolSize = poolSize;
        this.init();
    }

    public async acquirePage(): Promise<Page> {
        if (this.pages.length === 0) {
            return this.createNewPage();
        } else {
            return this.pages.pop()!;
        }
    }

    public async releasePage(page: Page) {
        await page.close();
        // const newPage = await this.createNewPage();
        // this.pages.push(newPage);
    }

    private async init() {
        const promises: Promise<Page>[] = [];
        for (let i = 0; i < this.poolSize; i++) {
            promises.push(this.createNewPage());
        }
        this.pages = await Promise.all(promises);
    }

    private async createNewPage() {
        const newBrowserContext = await this.puppeeterBrowser.createIncognitoBrowserContext();
        return newBrowserContext.newPage();
    }
}
