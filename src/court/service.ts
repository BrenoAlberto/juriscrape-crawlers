export class CourtService {
    private courtMap = {
        "02": "TJAL",
        "06": "TJCE"
    }

    public getCourtByCaseNumber(caseNumber: string): string {
        const matches = caseNumber.match(/\.(\d{2})\./)
        if (matches && matches[1]) {
            return this.courtMap[matches[1]]
        } else {
            throw new Error("Court not recognized")
        }
    }

    /**
     * @description I'm calling process the initial part of the CaseNumber, this entire part NNNNNNN-DD.AAAA  
    */
    public getProcessByCaseNumber(caseNumber: string): string {
        const matches = caseNumber.match(/(\d{7}.*\d{4})\./)
        if (matches && matches[1]) {
            return matches[1]
        } else {
            throw new Error("Process not recognized")
        }
    }

    public getUnitOriginByCaseNumber(caseNumber: string): string {
        const matches = caseNumber.match(/(\d{4})$/)
        if (matches && matches[1]) {
            return matches[1]
        } else {
            throw new Error("Unit Origin not recognized")
        }
    }

}