import { Page } from "puppeteer";
import { extractElementTextOrUndefined } from "../../utils/cssSelectorHelper";

export class SecondDegreeCasePage {
    private readonly elementsCSSSelectors = {
        caseClass: '#classeProcesso span',
        area: '#areaProcesso span',
        subject: '#assuntoProcesso span',
        distributionDate: '#dataHoraDistribuicaoProcesso span',
        judge: "#juizProcesso span",
        actionValue: '#valorAcaoProcesso span',
        partiesTableRows: "#tableTodasPartes tr",
        movementsTableRows: "#tabelaTodasMovimentacoes .containerMovimentacao",

        modalTitulo: '.modalTitulo',
    }

    constructor(private readonly page: Page) { }

    public async fetchCaseData(caseURL: string, _caseNumber: string) {
        await this.ensureIsInCasePage(caseURL);

        const [
            caseClass,
            area,
            subject,
            actionValue,
            parties,
            movements,
            _
        ] = await Promise.all([
            extractElementTextOrUndefined(this.page, this.elementsCSSSelectors.caseClass),
            extractElementTextOrUndefined(this.page, this.elementsCSSSelectors.area),
            extractElementTextOrUndefined(this.page, this.elementsCSSSelectors.subject),
            extractElementTextOrUndefined(this.page, this.elementsCSSSelectors.actionValue),
            this.extractParties(),
            this.extractMovements(),
            this.checkIfNeedsPassword()
        ]);

        return {
            caseClass: caseClass,
            area: area,
            subject: subject,
            actionValue: actionValue,
            parties,
            movements
        }
    }

    private async ensureIsInCasePage(caseURL: string) {
        if (!this.page.url().startsWith(caseURL)) {
            await this.page.goto(caseURL, { waitUntil: 'domcontentloaded' });
        }
    }

    private async checkIfNeedsPassword() {
        const modalText = await extractElementTextOrUndefined(this.page, this.elementsCSSSelectors.modalTitulo);
        if (modalText === "Senha do processo")
            throw new Error("Needs password");

    }

    private async extractParties() {
        return this.page.$$eval(this.elementsCSSSelectors.partiesTableRows, rows => {
            return Array.from(rows, row => {
                const columns = row.querySelectorAll('td');
                const type = columns[0]?.innerText.trim();
                let description = '';
                let lawyer;

                if (columns[1]) {
                    const advText = columns[1]?.innerText;
                    const splitIndex = advText.search(/Advogad[ao]:/i);
                    if (splitIndex !== -1) {
                        description = advText.slice(0, splitIndex).trim();
                        lawyer = advText.slice(splitIndex).replace(/Advogad[ao]:/i, '').trim();
                    } else {
                        description = advText.trim();
                    }
                }
                return { type, description, lawyer };
            });
        });
    }

    private async extractMovements() {
        return this.page.$$eval(this.elementsCSSSelectors.movementsTableRows, rows => {
            return Array.from(rows, row => {
                const date = row.querySelector('.dataMovimentacao')?.textContent?.trim();
                const description = row.querySelector('.descricaoMovimentacao')?.childNodes[0]?.textContent?.trim();
                const details = row.querySelector('.descricaoMovimentacao span')?.textContent?.trim();
                return { date, description, details };
            });
        });
    }
}