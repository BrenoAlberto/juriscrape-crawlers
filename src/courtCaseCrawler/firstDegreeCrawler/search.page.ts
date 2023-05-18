import { ElementHandle, Page, } from "puppeteer";

export class FirstDegreeSearchPage {
    private urls = {
        TJAL: "https://www2.tjal.jus.br/cpopg/open.do",
        TJCE: "https://esaj.tjce.jus.br/cpopg/open.do"
    }

    private readonly elementsCSSSelectors = {
        inputCaseNumber: "#numeroDigitoAnoUnificado",
        searchButton: "#botaoConsultarProcessos",
        inputOriginNumber: "#foroNumeroUnificado",
    }

    constructor(private readonly page: Page) { }

    public async goToCase(processNumber: string, originNumber: string, court: "TJAL" | "TJCE") {
        await this.ensureIsInSearchPage(court);

        await this.page.type(this.elementsCSSSelectors.inputCaseNumber, processNumber)
        await this.page.type(this.elementsCSSSelectors.inputOriginNumber, originNumber)

        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            this.page.click(this.elementsCSSSelectors.searchButton),
        ])
    }

    private async ensureIsInSearchPage(court: "TJAL" | "TJCE") {
        if (!this.page.url().startsWith(this.urls[court])) {
            await this.page.goto(this.urls[court]);
        }
    }
}