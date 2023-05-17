import { TJALFirstDegreeCaseCrawler } from "./firstDegree/crawler";
import { TJALSecondDegreeCaseCrawler } from "./secondDegree/crawler";
import { PreloadedFirstDegreePageManager } from "../pageManager/preloadedFirstDegreePageManager";
import { PageManager } from "../pageManager/pageManager";

export class GetCourtCase {
    constructor(
        private readonly tjalFirstDegreeCaseCrawler: TJALFirstDegreeCaseCrawler,
        private readonly tjalSecondDegreeCaseCrawler: TJALSecondDegreeCaseCrawler,
    ) { }

    public async getCourtCase(caseNumber: string, processNumber: string, originNumber: string): Promise<any> {
        const [firstDegreeData, secondDegreeData] = await Promise.all([
            this.tjalFirstDegreeCaseCrawler.scrapeCase(caseNumber, processNumber, originNumber),
            this.tjalSecondDegreeCaseCrawler.scrapeCase(caseNumber, processNumber),
        ]);

        return {
            firstDegreeData,
            secondDegreeData,
        }
    }

    static async create(pageManager: PageManager, preloadedFirstDegreePageManager: PreloadedFirstDegreePageManager): Promise<GetCourtCase> {
        const tjalFirstDegreeCaseCrawler = await TJALFirstDegreeCaseCrawler.create(preloadedFirstDegreePageManager);
        const tjalSecondDegreeCaseCrawler = await TJALSecondDegreeCaseCrawler.create(pageManager);
        return new GetCourtCase(tjalFirstDegreeCaseCrawler, tjalSecondDegreeCaseCrawler);
    }
}