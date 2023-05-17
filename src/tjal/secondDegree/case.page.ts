import { Page } from "puppeteer";

export class TJALSecondDegreeCasePage {
    // caseNumber: string;
    // court: string; // e.g., "TJAL" or "TJCE"
    // degree: string; // e.g., "1º grau" or "2º grau"
    // caseClass: string; // Changed 'class' to 'caseClass'
    // area: string;
    // subject: string;
    // distributionDate: string;
    // judge: string;
    // actionValue: number;
    // parties: PartyModel[];
    // movements: MovementModel[];
    private readonly elementsXPathSelectors = {
        caseClassSpan: '//div[@id="classeProcesso"]/span',
        areaSpan: '//div[@id="areaProcesso"]/span',
        subjectSpan: '//div[@id="assuntoProcesso"]/span',
        // data de distribuição 
        // juiz
        actionValueSpan: '//div[@id="valorAcaoProcesso"]/span',
    }

    constructor(private readonly page: Page) { }

    async fetchCaseData(caseURL: string) {
        await this.page.goto(caseURL);

        await this.page.waitForXPath(this.elementsXPathSelectors.caseClassSpan);
        const caseClassSpan = (await this.page.$x(this.elementsXPathSelectors.caseClassSpan))[0];
        const caseClass = await (await caseClassSpan.getProperty('textContent')).jsonValue();

        await this.page.waitForXPath(this.elementsXPathSelectors.areaSpan);
        const areaSpan = (await this.page.$x(this.elementsXPathSelectors.areaSpan))[0];
        const area = await (await areaSpan.getProperty('textContent')).jsonValue();

        await this.page.waitForXPath(this.elementsXPathSelectors.subjectSpan);
        const subjectSpan = (await this.page.$x(this.elementsXPathSelectors.subjectSpan))[0];
        const subject = await (await subjectSpan.getProperty('textContent')).jsonValue();

        await this.page.waitForXPath(this.elementsXPathSelectors.actionValueSpan);
        const actionValueSpan = (await this.page.$x(this.elementsXPathSelectors.actionValueSpan))[0];
        const actionValue = await (await actionValueSpan.getProperty('textContent')).jsonValue();

        return {
            caseClass: caseClass,
            area: area,
            subject: subject,
            actionValue: actionValue
        }
    }
}