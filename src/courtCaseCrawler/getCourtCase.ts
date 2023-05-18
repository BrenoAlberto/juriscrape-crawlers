import { FirstDegreeCaseCrawler } from "./firstDegreeCrawler/crawler";
import { SecondDegreeCaseCrawler } from "./secondDegreeCrawler/crawler";
import { PreloadedFirstDegreePageManager } from "../pageManager/preloadedFirstDegreePageManager";
import { PageManager } from "../pageManager/pageManager";

export class GetCourtCase {
    private constructor(
        private readonly firstDegreeCaseCrawler: FirstDegreeCaseCrawler,
        private readonly secondDegreeCaseCrawler: SecondDegreeCaseCrawler,
    ) { }

    public async execute(caseNumber: string, processNumber: string, originNumber: string): Promise<any> {
        const [firstDegreeData, secondDegreeData] = await Promise.all([
            this.firstDegreeCaseCrawler.scrapeCase(caseNumber, processNumber, originNumber),
            this.secondDegreeCaseCrawler.scrapeCase(caseNumber, processNumber),
        ]);

        return {
            firstDegreeData,
            secondDegreeData,
        }
    }

    public static async create(pageManager: PageManager, preloadedFirstDegreePageManager: PreloadedFirstDegreePageManager, court: "TJAL" | "TJCE"): Promise<GetCourtCase> {
        const firstDegreeCaseCrawler = await FirstDegreeCaseCrawler.create(preloadedFirstDegreePageManager, court);
        const secondDegreeCaseCrawler = await SecondDegreeCaseCrawler.create(pageManager);
        return new GetCourtCase(firstDegreeCaseCrawler, secondDegreeCaseCrawler);
    }
}