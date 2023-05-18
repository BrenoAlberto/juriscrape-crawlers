import { Browser, Page } from "puppeteer";

export class PageManager {
    private pages: Page[] = [];
    private readonly poolSize: number;

    private constructor(private readonly puppeeterBrowser: Browser, poolSize: number) {
        this.poolSize = poolSize;
    }

    public async acquirePage(): Promise<Page> {
        if (this.pages.length === 0) {
            return this.createNewPage();
        } else {
            return this.pages.pop()!;
        }
    }

    public async releasePage(page: Page) {
        await page.goto('about:blank');
        this.pages.push(page);
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

    public static async create(puppeeterBrowser: Browser, poolSize = 10) {
        const pageManager = new PageManager(puppeeterBrowser, poolSize);
        await pageManager.init();
        return pageManager;
    }
}
