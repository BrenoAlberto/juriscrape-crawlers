import { ElementHandle, Page, } from "puppeteer";

export class FirstDegreeSearchPage {
    private urls = {
        TJAL: "https://www2.tjal.jus.br/cpopg/open.do",
        TJCE: "https://esaj.tjce.jus.br/cpopg/open.do"
    }

    private readonly elementsXPathSelectors = {
        inputCaseNumber: "//input[@id='numeroDigitoAnoUnificado']",
        searchButton: "//input[@id='botaoConsultarProcessos']",
        inputOriginNumber: "//input[@id='foroNumeroUnificado']",
    }

    constructor(private readonly page: Page) { }

    public async goToCase(processNumber: string, originNumber: string, court: "TJAL" | "TJCE") {
        await this.ensureIsInSearchPage(court);

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

    private async ensureIsInSearchPage(court: "TJAL" | "TJCE") {
        if (!this.page.url().startsWith(this.urls[court])) {
            await this.page.goto(this.urls[court]);
        }
    }
}