import puppeteer from 'puppeteer'
import { CourtCaseProcessor } from './caseProcessor/caseProcessor'
import { PageManager, PreloadedPageManager } from '@juriscrape/driver'

import express from 'express'
import { CourtCaseCrawlerController } from './courtCaseCrawler/controller'

import dotenv from 'dotenv'
import { logger } from '@juriscrape/common'
import { generalSettings } from './setup'
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
  const pageManager = await PageManager.create(browser, generalSettings.preloadedEmptyPages)

  const preloadedPageManager = await PreloadedPageManager.create(browser, {
    tjal: { url: 'https://www2.tjal.jus.br/cpopg/open.do' },
    tjce: { url: 'https://esaj.tjce.jus.br/cpopg/open.do' }
  }, generalSettings.preloadedPagesPerCourt)

  const courtCaseProcessor = new CourtCaseProcessor(pageManager, preloadedPageManager)
  void courtCaseProcessor.startProcessing()

  const courtCaseCrawlerController = new CourtCaseCrawlerController(courtCaseProcessor)

  app.post('/crawl-court-cases', async (req, res) => await courtCaseCrawlerController.crawlCourtCases(req, res))

  app.listen(3008, () => { logger.info('Server is running on port 3008') })
}).catch(logger.error)
