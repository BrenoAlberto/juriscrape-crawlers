import { type Page } from 'puppeteer'
import { type Court } from '../../court/model'

export class FirstDegreeSearchPage {
  private readonly urls = {
    TJAL: 'https://www2.tjal.jus.br/cpopg/open.do',
    TJCE: 'https://esaj.tjce.jus.br/cpopg/open.do'
  }

  private readonly elementsCSSSelectors = {
    inputCaseNumber: '#numeroDigitoAnoUnificado',
    searchButton: '#botaoConsultarProcessos',
    inputOriginNumber: '#foroNumeroUnificado'
  }

  constructor (private readonly page: Page) { }

  public async goToCase (processNumber: string, originNumber: string, court: Court): Promise<void> {
    console.log(`Going to case ${processNumber} in ${court}`)
    await this.ensureIsInSearchPage(court)

    console.log(`Typing case number ${processNumber}`)
    await this.page.type(this.elementsCSSSelectors.inputCaseNumber, processNumber)
    console.log(`Typing origin number ${originNumber}`)
    await this.page.type(this.elementsCSSSelectors.inputOriginNumber, originNumber)

    console.log('Clicking search button')
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      this.page.click(this.elementsCSSSelectors.searchButton)
    ])
  }

  private async ensureIsInSearchPage (court: Court): Promise<void> {
    console.log(`Ensuring is in search page for ${court}`)
    if (!this.page.url().startsWith(this.urls[court])) {
      await this.page.goto(this.urls[court])
    }
  }
}
