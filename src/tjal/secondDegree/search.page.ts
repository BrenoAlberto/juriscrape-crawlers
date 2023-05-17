import { Page } from "puppeteer";

export class TJALSecondDegreeSearchPage {
    private tjalSecondDegreeURL = "https://www2.tjal.jus.br/cposg5"

    private readonly elementsXPathSelectors = {
        inputCaseNumber: "//input[@id='numeroDigitoAnoUnificado']",
        searchButton: "//input[@id='botaoConsultarProcessos']",
        selectedProcessRadioButton: '(//input[@id="processoSelecionado"])[1]'
    }

    constructor(private readonly page: Page) { }

    async fetchCaseURL(caseNumber: string, processNumber: string) {
        const url = `${this.tjalSecondDegreeURL}/search.do?conversationId=&paginaConsulta=0&cbPesquisa=NUMPROC&numeroDigitoAnoUnificado=${processNumber}&foroNumeroUnificado=0001&dePesquisaNuUnificado=${caseNumber}&dePesquisaNuUnificado=UNIFICADO&dePesquisa=&tipoNuProcesso=UNIFICADO`;
        await this.page.goto(url);

        await this.page.waitForXPath(this.elementsXPathSelectors.selectedProcessRadioButton);
        const selectedProcessRadioButton = (await this.page.$x(this.elementsXPathSelectors.selectedProcessRadioButton))[0];

        const processCodeValue = await (await selectedProcessRadioButton.getProperty('value')).jsonValue();
        const processCode = processCodeValue as string;

        return `${this.tjalSecondDegreeURL}/show.do?processo.codigo=${processCode}`;
    }
}