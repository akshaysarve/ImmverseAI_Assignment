import { expect, type Page } from '@playwright/test';

export class AccountPage {
  constructor(private readonly page: Page) {}

  async navigateToOpenNewAccount(): Promise<void> {
    await this.page.getByRole('link', {
      name: 'Open New Account'
    }).click();
  }

  async openCheckingAccount(sourceAccountId: string): Promise<string> {
    const accountDropdown = this.page.locator('#fromAccountId');

    await expect(accountDropdown).toBeVisible();

    // Select Checking account type
    await this.page.locator('#type').selectOption({
      label: 'CHECKING'
    });

    // Wait for the source account option
    const sourceAccountOption = accountDropdown.locator(
      `option[value="${sourceAccountId}"]`
    );

    await expect(sourceAccountOption).toHaveCount(1);

    await accountDropdown.selectOption(sourceAccountId);

    // Wait for account creation API response
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/createAccount')
    );

    await this.page.getByRole('button', {
      name: 'Open New Account'
    }).click();

    const response = await responsePromise;

    expect(response.status()).toBe(200);

    const responseData = await response.json();
    const newAccountId = String(responseData.id);

    // Verify UI confirmation
    await expect(
      this.page.getByText('Account Opened!')
    ).toBeVisible();

    await expect(
      this.page.getByText(`Your new account number: ${newAccountId}`)
    ).toBeVisible();

    return newAccountId;
  }
}
