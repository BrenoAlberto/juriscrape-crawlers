import { FirstDegreeCaseCrawler } from "./firstDegreeCrawler/crawler";
import { SecondDegreeCaseCrawler } from "./secondDegreeCrawler/crawler";
import { PreloadedFirstDegreePageManager } from "../pageManager/preloadedFirstDegreePageManager";
import { PageManager } from "../pageManager/pageManager";
import { Court, CourtCaseModel } from "../court/model";

export class GetCourtCase {
    private constructor(
        private readonly firstDegreeCaseCrawler: FirstDegreeCaseCrawler,
        private readonly secondDegreeCaseCrawler: SecondDegreeCaseCrawler,
    ) { }

    public async execute(caseNumber: string, processNumber: string, originNumber: string): Promise<CourtCaseModel> {
        const [firstDegreeData, secondDegreeData] = await Promise.all([
            this.firstDegreeCaseCrawler.scrapeCase(caseNumber, processNumber, originNumber),
            this.secondDegreeCaseCrawler.scrapeCase(caseNumber, processNumber),
        ]);

        return {
            caseNumber,
            firstDegreeCaseData: firstDegreeData,
            secondDegreeCaseData: secondDegreeData,
            crawlStatus: "available"
        }
    }

    public static async create(pageManager: PageManager, preloadedFirstDegreePageManager: PreloadedFirstDegreePageManager, court: Court): Promise<GetCourtCase> {
        const firstDegreeCaseCrawler = await FirstDegreeCaseCrawler.create(preloadedFirstDegreePageManager, court);
        const secondDegreeCaseCrawler = await SecondDegreeCaseCrawler.create(pageManager, court);
        return new GetCourtCase(firstDegreeCaseCrawler, secondDegreeCaseCrawler);
    }
}