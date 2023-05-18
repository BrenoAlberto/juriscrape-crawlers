import { GetCourtCase } from "../courtCaseCrawler/getCourtCase";
import { PageManager } from "../pageManager/pageManager";
import { PreloadedFirstDegreePageManager } from "../pageManager/preloadedFirstDegreePageManager";
import { concurrentTaskQueue } from "../utils/promise";

interface CourtCaseModel {
    caseNumber: string;
    processNumber: string;
    originNumber: string;
    court: "TJAL" | "TJCE";
}

export class CourtCaseProcessor {
    private readonly courtCaseQueue: CourtCaseModel[] = [
        // { caseNumber: "0700930-26.2012.8.02.0001", processNumber: "0700930-26.2012", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0701589-83.2022.8.02.0001", processNumber: "0701589-83.2022", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0716471-02.2012.8.02.0001", processNumber: "0716471-02.2012", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0700315-22.2021.8.02.0033", processNumber: "0700315-22.2021", originNumber: "0033", court: "TJAL" },
        // { caseNumber: "0010285-72.2010.8.02.0001", processNumber: "0010285-72.2010", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0725794-21.2018.8.02.0001", processNumber: "0725794-21.2018", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0001155-63.2007.8.02.0001", processNumber: "0001155-63.2007", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0705858-68.2022.8.02.0001", processNumber: "0705858-68.2022", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0713287-86.2022.8.02.0001", processNumber: "0713287-86.2022", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0730146-17.2021.8.02.0001", processNumber: "0730146-17.2021", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0717269-45.2021.8.02.0001", processNumber: "0717269-45.2021", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0727321-37.2020.8.02.0001", processNumber: "0727321-37.2020", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0735659-29.2022.8.02.0001", processNumber: "0735659-29.2022", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0730284-81.2021.8.02.0001", processNumber: "0730284-81.2021", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0725856-56.2021.8.02.0001", processNumber: "0725856-56.2021", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0710665-44.2016.8.02.0001", processNumber: "0710665-44.2016", originNumber: "0001", court: "TJAL" },
        // { caseNumber: "0723191-33.2022.8.02.0001", processNumber: "0723191-33.2022", originNumber: "0001", court: "TJAL" },
        { caseNumber: "0050943-69.2021.8.06.0122", processNumber: "0050943-69.2021", originNumber: "0122", court: "TJCE" }, // keep
        { caseNumber: "0007142-81.2018.8.06.0131", processNumber: "0007142-81.2018", originNumber: "0131", court: "TJCE" },  // keep
        { caseNumber: "0050287-15.2021.8.06.0122", processNumber: "0050287-15.2021", originNumber: "0122", court: "TJCE" },  // keep
        // { caseNumber: "0001492-56.2019.8.06.0151", processNumber: "0001492-56.2019", originNumber: "0151", court: "TJCE" },
        // { caseNumber: "0241524-16.2021.8.06.0001", processNumber: "0241524-16.2021", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0000903-87.2023.8.06.0001", processNumber: "0000903-87.2023", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0000861-38.2023.8.06.0001", processNumber: "0000861-38.2023", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0000827-63.2023.8.06.0001", processNumber: "0000827-63.2023", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0000898-65.2023.8.06.0001", processNumber: "0000898-65.2023", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0000923-78.2023.8.06.0001", processNumber: "0000923-78.2023", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0000922-93.2023.8.06.0001", processNumber: "0000922-93.2023", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0000841-47.2023.8.06.0001", processNumber: "0000841-47.2023", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0000825-93.2023.8.06.0001", processNumber: "0000825-93.2023", originNumber: "0001", court: "TJCE" },
        // { caseNumber: "0050458-35.2021.8.06.0101", processNumber: "0050458-35.2021", originNumber: "0101", court: "TJCE" },
        // { caseNumber: "0052709-22.2021.8.06.0167", processNumber: "0052709-22.2021", originNumber: "0167", court: "TJCE" },
        // { caseNumber: "0623356-64.2022.8.06.0000", processNumber: "0623356-64.2022", originNumber: "0000", court: "TJCE" },
        // { caseNumber: "0050996-50.2021.8.06.0122", processNumber: "0050996-50.2021", originNumber: "0122", court: "TJCE" }
    ];
    private readonly workerLimit = 10;
    private readonly delay = 2000;
    private isProcessing = false;

    constructor(
        private readonly pageManager: PageManager,
        private readonly preloadedFirstDegreePageManager: PreloadedFirstDegreePageManager,
    ) { }

    public async startProcessing() {
        this.isProcessing = true;
        while (this.isProcessing) {
            await this.processCourtCases();
        }
    }

    public stopProcessing() {
        this.isProcessing = false;
    }

    public addCourtCase(courtCase: CourtCaseModel) {
        this.courtCaseQueue.push(courtCase);
    }

    private async processCourtCases() {
        const firstBatchStart = performance.now();
        if (this.courtCaseQueue.length > 0) {
            const tasks = this.courtCaseQueue.splice(0, this.courtCaseQueue.length).map(courtCase =>
                async () => {
                    const getCourtCase = await GetCourtCase.create(
                        this.pageManager,
                        this.preloadedFirstDegreePageManager,
                        courtCase.court
                    );
                    const courtCaseStarted = performance.now();
                    await getCourtCase.execute(courtCase.caseNumber, courtCase.processNumber, courtCase.originNumber)
                    const courtCaseEnded = performance.now();
                    const courtCaseDuration = courtCaseEnded - courtCaseStarted;
                    console.log(`Court case ${courtCase.caseNumber} duration: ${courtCaseDuration}`);
                }
            );
            await concurrentTaskQueue(tasks, this.workerLimit);
            const firstBatchEnd = performance.now();
            const firstBatchDuration = firstBatchEnd - firstBatchStart;
            console.log(`First batch duration: ${firstBatchDuration}`);
        } else {
            await new Promise(resolve => setTimeout(resolve, this.delay));
        }
    }
}
