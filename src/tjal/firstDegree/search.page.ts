import { ElementHandle, Page, } from "puppeteer";

export class TJALFirstDegreeSearchPage {
    private tjalFirstDegreeInitialURL = "https://www2.tjal.jus.br/cpopg/open.do"

    private readonly elementsXPathSelectors = {
        inputCaseNumber: "//input[@id='numeroDigitoAnoUnificado']",
        searchButton: "//input[@id='botaoConsultarProcessos']",
        inputOriginNumber: "//input[@id='foroNumeroUnificado']",
    }

    constructor(private readonly page: Page) { }

    private async ensureIsInSearchPage() {
        if (!this.page.url().startsWith(this.tjalFirstDegreeInitialURL)) {
            await this.page.goto(this.tjalFirstDegreeInitialURL);
        }
    }

    public async goToCase(processNumber: string, originNumber: string) {
        await this.ensureIsInSearchPage();

        await this.page.waitForXPath(this.elementsXPathSelectors.inputCaseNumber);
        const inputCaseNumber = (await this.page.$x(this.elementsXPathSelectors.inputCaseNumber))[0];
        await inputCaseNumber.type(processNumber);


        await this.page.waitForXPath(this.elementsXPathSelectors.inputOriginNumber);
        const inputOriginNumber = (await this.page.$x(this.elementsXPathSelectors.inputOriginNumber))[0];
        await inputOriginNumber.type(originNumber);

        await this.page.waitForXPath(this.elementsXPathSelectors.searchButton);
        const searchButton = (await this.page.$x(this.elementsXPathSelectors.searchButton))[0] as ElementHandle
        await searchButton.click();
    }
}