import { expect, type Page, type Response } from '@playwright/test';

export class TransferPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.getByRole('link', {
      name: 'Transfer Funds'
    }).click();
  }

  async transferFunds(
    amount: string,
    sourceAccountId: string,
    destinationAccountId: string
  ): Promise<Response> {

    const fromDropdown = this.page.locator('#fromAccountId');
    const toDropdown = this.page.locator('#toAccountId');

    // Wait for dynamically loaded accounts
    await expect(
      fromDropdown.locator(`option[value="${sourceAccountId}"]`)
    ).toHaveCount(1);

    await expect(
      toDropdown.locator(`option[value="${destinationAccountId}"]`)
    ).toHaveCount(1);

    // Select accounts
    await fromDropdown.selectOption(sourceAccountId);
    await toDropdown.selectOption(destinationAccountId);

    // Enter amount
    await this.page.locator('#amount').fill(amount);

    // Wait for transfer API response
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/transfer')
    );

    // Submit transfer
    await this.page.locator('input[type="submit"]').click();

    const response = await responsePromise;

    expect(response.status()).toBe(200);

    // Verify UI confirmation
    await expect(
      this.page.getByText('Transfer Complete!')
    ).toBeVisible();

    return response;
  }
}
