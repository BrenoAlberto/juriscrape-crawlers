import { Page } from "puppeteer";

export const extractElementTextOrUndefined = async (page: Page, selector: string) => {
    try {
        return await page.$eval(selector, (el) => el.textContent);
    } catch {
        return undefined;
    }
}
