import { FirstDegreeCaseCrawler } from './firstDegreeCrawler/crawler'
import { SecondDegreeCaseCrawler } from './secondDegreeCrawler/crawler'
import { type PreloadedPageManager } from '../pageManager/preloadedPageManager'
import { type PageManager } from '../pageManager/pageManager'
import { type Court, type CourtCaseModel } from '../court/model'

export class GetCourtCase {
  private constructor (
    private readonly firstDegreeCaseCrawler: FirstDegreeCaseCrawler,
    private readonly secondDegreeCaseCrawler: SecondDegreeCaseCrawler
  ) { }

  public async execute (caseNumber: string, processNumber: string, originNumber: string): Promise<CourtCaseModel> {
    const [firstDegreeData, secondDegreeData] = await Promise.all([
      this.firstDegreeCaseCrawler.scrapeCase(caseNumber, processNumber, originNumber),
      this.secondDegreeCaseCrawler.scrapeCase(caseNumber, processNumber)
    ])

    return {
      caseNumber,
      firstDegreeCaseData: firstDegreeData,
      secondDegreeCaseData: secondDegreeData,
      crawlStatus: 'available'
    }
  }

  public static async create (pageManager: PageManager, preloadedPageManager: PreloadedPageManager, court: Court): Promise<GetCourtCase> {
    const firstDegreeCaseCrawler = await FirstDegreeCaseCrawler.create(preloadedPageManager, court)
    const secondDegreeCaseCrawler = await SecondDegreeCaseCrawler.create(pageManager, court)
    return new GetCourtCase(firstDegreeCaseCrawler, secondDegreeCaseCrawler)
  }
}
