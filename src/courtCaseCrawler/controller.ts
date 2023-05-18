import { Request, Response } from 'express';

import { CourtCaseProcessor, CrawlCourtCase } from "../caseProcessor/caseProcessor";

export class CourtCaseCrawlerController {
    constructor(
        private readonly courtCaseProcessor: CourtCaseProcessor
    ) { }

    public async crawlCourtCases(req: Request, res: Response) {
        try {
            const courtCases: CrawlCourtCase[] = req.body;
            this.courtCaseProcessor.addCourtCases(courtCases)
            return res.status(200).send({ message: "Court cases added to the queue" });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }
}