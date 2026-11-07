import { expect, type Page, type Response } from '@playwright/test';
export class LoanPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.getByRole('link', {
      name: 'Request Loan'
    }).click();
  }

  async applyForLoan(
    loanAmount: number,
    downPayment: number,
    sourceAccountId: string
    ): Promise<Response> {
    // Enter loan amount
    await this.page.locator('#amount').fill(String(loanAmount));

    // Enter down payment
    await this.page.locator('#downPayment').fill(String(downPayment));

    // Select source account dynamically
    await this.page.locator('#fromAccountId')
      .selectOption(sourceAccountId);

    // Wait for loan API response
    const responsePromise = this.page.waitForResponse(
      response => response.url().toLowerCase().includes('requestloan')
    );

    // Submit loan application
    await this.page.locator('input[value="Apply Now"]').click();

    return await responsePromise;
  }

  async verifyLoanApproval(loanAccountId: string): Promise<void> {

    await expect(
      this.page.getByText(/Status:\s*Approved/i)
    ).toBeVisible();

    await expect(
      this.page.getByText(
        `Your new account number: ${loanAccountId}`
      )
    ).toBeVisible();
  }
}
