import { Page } from "puppeteer";

export class FirstDegreeCasePage {
    private readonly elementsCSSSelectors = {
        caseClass: '#classeProcesso',
        area: '#areaProcesso',
        subject: '#assuntoProcesso',
        // data de distribuição 
        distributionDate: '#dataHoraDistribuicaoProcesso',
        judge: "#juizProcesso",
        actionValue: '#valorAcaoProcesso',
    }

    constructor(private readonly page: Page) { }

    public async fetchCaseData(caseNumber: string) {
        try {

            const [
                caseClass,
                area,
                subject,
                distributionDate,
                judge,
                actionValue
            ] = await Promise.all([
                this.page.$eval(this.elementsCSSSelectors.caseClass, (el) => el.textContent),
                this.page.$eval(this.elementsCSSSelectors.area, (el) => el.textContent),
                this.page.$eval(this.elementsCSSSelectors.subject, (el) => el.textContent),
                this.page.$eval(this.elementsCSSSelectors.distributionDate, (el) => el.textContent),
                this.page.$eval(this.elementsCSSSelectors.judge, (el) => el.textContent),
                this.page.$eval(this.elementsCSSSelectors.actionValue, (el) => el.textContent),
            ]);

            return {
                degree: "first",
                caseNumber,
                caseClass: caseClass,
                area: area,
                subject: subject,
                distributionDate: distributionDate,
                judge: judge,
                actionValue: actionValue
            }
        } catch (error) {
            console.log(error);
            return {
                degree: "first",
                caseNumber,
                caseClass: '',
                area: '',
                subject: '',
                distributionDate: '',
                judge: '',
                actionValue: ''
            }
        }
    }
}