import { Court, CourtCaseModel } from "../court/model";
import { GetCourtCase } from "../courtCaseCrawler/getCourtCase";
import { PageManager } from "../pageManager/pageManager";
import { PreloadedFirstDegreePageManager } from "../pageManager/preloadedFirstDegreePageManager";
import { concurrentTaskQueue } from "../utils/promise";

export interface CrawlCourtCase {
    caseNumber: string;
    processNumber: string;
    originNumber: string;
    court: Court;
}

export class CourtCaseProcessor {
    private readonly courtCaseQueue: CrawlCourtCase[] = [];
    private readonly processedCourtCases: CourtCaseModel[] = [];
    private readonly workerLimit = 1000;
    private readonly concurrencyLimit = 10;
    private readonly delay = 2000;
    private isProcessing = false;
    private intervalId?: NodeJS.Timeout;

    constructor(
        private readonly pageManager: PageManager,
        private readonly preloadedFirstDegreePageManager: PreloadedFirstDegreePageManager,
    ) { }

    public async startProcessing() {
        this.isProcessing = true;
        this.intervalId = setInterval(() => this.sendProcessedCourtCases(), 2000); // Sends the processed court cases every 2 seconds to the API
        while (this.isProcessing && this.courtCaseQueue.length < this.workerLimit) {
            try {
                await this.processCourtCases();
            } catch (error) {
                console.error(`Error during court case processing: ${error}`);
            }
        }
    }

    public stopProcessing() {
        this.isProcessing = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }

    public addCourtCases(courtCases: CrawlCourtCase[]) {
        this.courtCaseQueue.push(...courtCases);
    }

    private async sendProcessedCourtCases() {
        if (this.processedCourtCases.length > 0) {
            const casesToSend = this.processedCourtCases.splice(0, this.processedCourtCases.length);

            try {
                await fetch(`${process.env.TJ_API_URL!}/insert-court-cases`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(casesToSend),
                });
            } catch (error) {
                console.error(`Failed to send processed court cases: ${error}`);
                this.processedCourtCases.unshift(...casesToSend);
            }
        }
    }

    private async processCourtCases(): Promise<void> {
        if (this.courtCaseQueue.length > 0) {
            const tasks = this.courtCaseQueue.splice(0, this.workerLimit).map(courtCase =>
                async () => {
                    try {
                        const getCourtCase = await GetCourtCase.create(
                            this.pageManager,
                            this.preloadedFirstDegreePageManager,
                            courtCase.court
                        );
                        this.processedCourtCases.push(await getCourtCase.execute(courtCase.caseNumber, courtCase.processNumber, courtCase.originNumber))
                    } catch (error) {
                        console.error(`Failed to get court case: ${error}`);
                        this.processedCourtCases.push({
                            caseNumber: courtCase.caseNumber,
                            crawlStatus: "failed"
                        })
                    }
                }
            );
            await concurrentTaskQueue(tasks, this.concurrencyLimit);
        } else {
            await new Promise(resolve => setTimeout(resolve, this.delay));
        }
    }
}
