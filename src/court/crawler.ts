import { CourtCaseModel } from "./model"

export interface CourtCrawler {
    scrapeCase(caseNumber: string, processNumber: string, originNumber: string): Promise<CourtCaseModel>
}