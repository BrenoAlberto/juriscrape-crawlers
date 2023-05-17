
interface MovementModel {
    date: string;
    movement: string;
}

interface PartyModel {
    name: string;
    type: string;
}

export class CourtCaseModel {
    caseNumber: string;
    court: string; // e.g., "TJAL" or "TJCE"
    degree: string; // e.g., "1º grau" or "2º grau"
    caseClass: string; // Changed 'class' to 'caseClass'
    area: string;
    subject: string;
    distributionDate: string;
    judge: string;
    actionValue: number;
    parties: PartyModel[];
    movements: MovementModel[];

    constructor(caseNumber: string, court: string, degree: string, caseClass: string, area: string, subject: string, distributionDate: string, judge: string, actionValue: number, parties: PartyModel[], movements: MovementModel[]) {
        this.caseNumber = caseNumber;
        this.court = court;
        this.degree = degree;
        this.caseClass = caseClass; // Changed 'class' to 'caseClass'
        this.area = area;
        this.subject = subject;
        this.distributionDate = distributionDate;
        this.judge = judge;
        this.actionValue = actionValue;
        this.parties = parties;
        this.movements = movements;
    }
}
