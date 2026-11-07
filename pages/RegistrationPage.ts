import type { Page } from '@playwright/test';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  ssn: string;
  username: string;
  password: string;
}

export class RegistrationPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto(
      'https://parabank.parasoft.com/parabank/register.htm'
    );
  }

  async register(data: RegistrationData): Promise<void> {
    await this.page.locator('[name="customer.firstName"]').fill(data.firstName);
    await this.page.locator('[name="customer.lastName"]').fill(data.lastName);
    await this.page.locator('[name="customer.address.street"]').fill(data.street);
    await this.page.locator('[name="customer.address.city"]').fill(data.city);
    await this.page.locator('[name="customer.address.state"]').fill(data.state);
    await this.page.locator('[name="customer.address.zipCode"]').fill(data.zipCode);
    await this.page.locator('[name="customer.phoneNumber"]').fill(data.phoneNumber);
    await this.page.locator('[name="customer.ssn"]').fill(data.ssn);
    await this.page.locator('[name="customer.username"]').fill(data.username);
    await this.page.locator('[name="customer.password"]').fill(data.password);
    await this.page.locator('[name="repeatedPassword"]').fill(data.password);

    await this.page.locator('input[type="submit"]').last().click();
  }
}
