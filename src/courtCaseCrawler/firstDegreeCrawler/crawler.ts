import { type Page } from 'puppeteer'
import { type CourtCrawler } from '../../court/crawler'
import { FirstDegreeSearchPage } from './search.page'
import { FirstDegreeCasePage } from './case.page'
import { type PreloadedPageManager } from '@juriscrape/driver'
import { type Court } from '../../court/model'
import { logger } from '@juriscrape/common'

export class FirstDegreeCaseCrawler implements CourtCrawler {
  private firstDegreeSearchPage: FirstDegreeSearchPage | undefined
  private firstDegreeCasePage: FirstDegreeCasePage | undefined
  private page: Page | undefined

  private constructor (
    private readonly pageManager: PreloadedPageManager,
    private readonly court: Court
  ) { }

  public async scrapeCase (_caseNumber: string, processNumber: string, originNumber: string): Promise<any> {
    this.ensurePageIsInitialized()
    const startPerf = performance.now()
    try {
      await this.firstDegreeSearchPage!.goToCase(processNumber, originNumber, this.court)
      const caseData = await this.firstDegreeCasePage!.fetchCaseData()
      const endPerf = performance.now()
      logger.info(`Case ${processNumber} took ${(endPerf - startPerf) / 1000} seconds to scrape.`)
      this.releasePage()
      return caseData
    } catch (error) {
      const endPerf = performance.now()
      logger.info(`Case ${processNumber} took ${(endPerf - startPerf) / 1000} seconds to scrape - NO DATA.`)
      this.releasePage()
    }
  }

  public static async create (pageManager: PreloadedPageManager, court: Court): Promise<FirstDegreeCaseCrawler> {
    const crawler = new FirstDegreeCaseCrawler(pageManager, court)
    await crawler.init()
    return crawler
  }

  private async init (): Promise<void> {
    this.page = await this.pageManager.acquirePage(this.court)
    this.firstDegreeSearchPage = new FirstDegreeSearchPage(this.page)
    this.firstDegreeCasePage = new FirstDegreeCasePage(this.page)
  }

  private releasePage (): void {
    if (!this.page) return
    void this.pageManager.releasePage(this.page, this.court)
    this.page = undefined
  }

  private ensurePageIsInitialized (): void {
    if (!this.page) {
      throw new Error('FirstDegreeCaseCrawler instance is not initialized. Call init before using it.')
    }
  }
}
