import { type Court, type CourtCaseModel } from '../court/model'
import { GetCourtCase } from '../courtCaseCrawler/getCourtCase'
import { type PageManager } from '../pageManager/pageManager'
import { type PreloadedFirstDegreePageManager } from '../pageManager/preloadedFirstDegreePageManager'
import { generalSettings } from '../setup'
import { concurrentTaskQueue } from '../utils/promise'

export interface CrawlCourtCase {
  caseNumber: string
  processNumber: string
  originNumber: string
  court: Court
}

export class CourtCaseProcessor {
  private readonly courtCaseQueue: CrawlCourtCase[] = []
  private readonly processedCourtCases: CourtCaseModel[] = []
  private readonly workerLimit = generalSettings.backgroundQueueCrawlLimit
  private readonly concurrencyLimit = generalSettings.backgroundConcurrencyCrawlLimit
  private readonly delay = generalSettings.emptyQueueDelay
  private isProcessing = false
  private intervalId?: NodeJS.Timeout

  constructor (
    private readonly pageManager: PageManager,
    private readonly preloadedFirstDegreePageManager: PreloadedFirstDegreePageManager
  ) { }

  public async startProcessing (): Promise<void> {
    this.isProcessing = true
    this.intervalId = setInterval(async () => { await this.sendProcessedCourtCases() }, generalSettings.saveProcessedCasesInterval) // Sends the processed court cases every 10 seconds to the API
    console.log('Processing court cases with the following settings:')
    console.table({
      workerLimit: this.workerLimit,
      concurrencyLimit: this.concurrencyLimit,
      delay: this.delay,
      queueSize: this.courtCaseQueue.length
    })
    while (this.isProcessing && this.courtCaseQueue.length < this.workerLimit) {
      try {
        await this.processCourtCases()
      } catch (error) {
        console.error('Error during court case processing', error)
      }
    }
  }

  public stopProcessing (): void {
    console.log('Stopping court case processing')
    this.isProcessing = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  public addCourtCases (courtCases: CrawlCourtCase[]): void {
    console.log(`Adding ${courtCases.length} court cases to the queue`)
    this.courtCaseQueue.push(...courtCases)
  }

  private async sendProcessedCourtCases (): Promise<void> {
    if (this.processedCourtCases.length > 0) {
      const casesToSend = this.processedCourtCases.splice(0, this.processedCourtCases.length)

      console.log(`Sending ${casesToSend.length} processed court cases`)

      try {
        const promises: Array<() => Promise<void>> = []
        for (const caseToSend of casesToSend) {
          promises.push(async () => {
            await fetch(`${process.env.TJ_API_URL!}/insert-court-cases`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify([caseToSend])
            })
          })
        }
        await concurrentTaskQueue(promises, generalSettings.saveProcessedCasesConcurrencyLimit)
      } catch (error) {
        console.error('Failed to send processed court cases: ', error)
        this.processedCourtCases.unshift(...casesToSend)
      }
    }
  }

  private async processCourtCases (): Promise<void> {
    if (this.courtCaseQueue.length > 0) {
      console.log(`In queue: ${this.courtCaseQueue.length} court cases`)
      console.log(`Processing up to ${this.workerLimit} court cases`)
      const tasks = this.courtCaseQueue.splice(0, this.workerLimit).map(courtCase =>
        async () => {
          try {
            const getCourtCase = await GetCourtCase.create(
              this.pageManager,
              this.preloadedFirstDegreePageManager,
              courtCase.court
            )
            this.processedCourtCases.push(await getCourtCase.execute(courtCase.caseNumber, courtCase.processNumber, courtCase.originNumber))
          } catch (error) {
            console.error('Failed to get court case: ', error)
            this.processedCourtCases.push({
              caseNumber: courtCase.caseNumber,
              crawlStatus: 'failed'
            })
          }
        }
      )
      await concurrentTaskQueue(tasks, this.concurrencyLimit)
    } else {
      await new Promise(resolve => setTimeout(resolve, this.delay))
    }
  }
}
