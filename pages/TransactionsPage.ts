import { expect, type Page } from '@playwright/test';

export class TransactionsPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.getByRole('link', {
      name: 'Find Transactions'
    }).click();
  }

  async searchByDateRange(
    accountId: string,
    fromDate: string,
    toDate: string
  ): Promise<void> {

    await this.page.locator('#accountId').selectOption(accountId);

    await this.page.locator('#fromDate').fill(fromDate);
    await this.page.locator('#toDate').fill(toDate);

    await this.page.locator('#findByDateRange').click();

    await this.page.waitForLoadState('networkidle');
  }

  async getTransactionRows(): Promise<string[][]> {

    const rows = await this.page.locator('#transactionTable tr')
      .evaluateAll(elements =>
        elements.map(row =>
          Array.from(row.querySelectorAll('th, td')).map(
            cell => cell.textContent?.trim() ?? ''
          )
        )
      );

    return rows;
  }
}
