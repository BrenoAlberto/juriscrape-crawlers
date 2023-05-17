
interface MovementModel {
    date: string;
    movement: string;
}

interface PartyModel {
    name: string;
    type: string;
}

type Court = "TJAL" | "TJCE";

type Degree = "first" | "second";

export class CourtCaseModel {
    caseNumber: string;
    court: Court;
    degree: Degree;
    caseClass: string;
    area: string;
    subject: string;
    distributionDate: string;
    judge: string;
    actionValue: number;
    parties: PartyModel[];
    movements: MovementModel[];

    constructor(caseNumber: string, court: Court, degree: Degree, caseClass: string, area: string, subject: string, distributionDate: string, judge: string, actionValue: number, parties: PartyModel[], movements: MovementModel[]) {
        this.caseNumber = caseNumber;
        this.court = court;
        this.degree = degree;
        this.caseClass = caseClass;
        this.area = area;
        this.subject = subject;
        this.distributionDate = distributionDate;
        this.judge = judge;
        this.actionValue = actionValue;
        this.parties = parties;
        this.movements = movements;
    }
}
