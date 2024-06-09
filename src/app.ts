import puppeteer from 'puppeteer'
import { CourtCaseProcessor } from './caseProcessor/caseProcessor'
import { PageManager } from './pageManager/pageManager'
import { PreloadedFirstDegreePageManager } from './pageManager/preloadedFirstDegreePageManager'

import express from 'express'
import { CourtCaseCrawlerController } from './courtCaseCrawler/controller'

import dotenv from 'dotenv'
import { logger } from '@tjcommon/common'
dotenv.config()

const app = express()
app.use(express.json())

puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
}).then(async browser => {
  const pageManager = await PageManager.create(browser)
  const preloadedFirstDegreePageManager = await PreloadedFirstDegreePageManager.create(browser)

  const courtCaseProcessor = new CourtCaseProcessor(pageManager, preloadedFirstDegreePageManager)
  void courtCaseProcessor.startProcessing()

  const courtCaseCrawlerController = new CourtCaseCrawlerController(courtCaseProcessor)

  app.post('/crawl-court-cases', async (req, res) => await courtCaseCrawlerController.crawlCourtCases(req, res))

  app.listen(3008, () => { logger.info('Server is running on port 3008') })
}).catch(logger.error)
