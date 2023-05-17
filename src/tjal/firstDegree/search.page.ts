import { ElementHandle, Page, } from "puppeteer";

export class TJALFirstDegreeSearchPage {
    private readonly elementsXPathSelectors = {
        inputCaseNumber: "//input[@id='numeroDigitoAnoUnificado']",
        searchButton: "//input[@id='botaoConsultarProcessos']",
    }

    constructor(private readonly page: Page) { }

    async searchCase(caseNumber: string) {
        await this.page.waitForXPath(this.elementsXPathSelectors.inputCaseNumber);
        const inputCaseNumber = (await this.page.$x(this.elementsXPathSelectors.inputCaseNumber))[0];
        await inputCaseNumber.type(caseNumber);

        await this.page.waitForXPath(this.elementsXPathSelectors.searchButton);
        const searchButton = (await this.page.$x(this.elementsXPathSelectors.searchButton))[0] as ElementHandle
        await searchButton.click();
    }
}