import { test, expect } from '@playwright/test';
import { RegistrationPage } from '../../pages/RegistrationPage.js';
import { AccountPage } from '../../pages/AccountPage.js';
import { LoanPage } from '../../pages/LoanPage.js';
import { TransferPage } from '../../pages/TransferPage.js';
import { TransactionsPage } from '../../pages/TransactionsPage.js';
import { generateRegistrationData } from '../../utils/TestData.js';
import { XMLParser } from 'fast-xml-parser';

test('User should register and open a Checking account successfully', async ({ page, request }) => {

  const registrationPage = new RegistrationPage(page);
  const userData = generateRegistrationData();

  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false
  });

  const accountPage = new AccountPage(page);
  // Step 1: Register user
  await registrationPage.navigate();
  await registrationPage.register(userData);

  await expect(
  page.getByText(/Your account was created successfully\.\s*You are now logged in\./i)
).toBeVisible();

  console.log('Registration successful!');
  console.log('Username:', userData.username);

  // Step 2: Verify automatic login
  await expect(
    page.getByText(`Welcome ${userData.firstName} ${userData.lastName}`)
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Accounts Overview' })
  ).toBeVisible();

  console.log('Automatic login successful!');

  // Step 3: Get customer ID using API
  const customerResponse = await request.get(
    `https://parabank.parasoft.com/parabank/services/bank/login/${encodeURIComponent(userData.username)}/${encodeURIComponent(userData.password)}`
  );

  expect(customerResponse.status()).toBe(200);

  const customerData = parser.parse(
    await customerResponse.text()
  );

  const customerId = String(customerData.customer.id);

  console.log('Customer ID:', customerId);

// Step 4: Get existing source account
  const accountsResponse = await request.get(
    `https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}/accounts`
  );

  expect(accountsResponse.status()).toBe(200);

  const accountsData = parser.parse(
    await accountsResponse.text()
  );

  const sourceAccountId = String(
    accountsData.accounts.account.id
  );

  console.log('Source Account ID:', sourceAccountId);
 
  // Step 5: Open new Checking account using AccountPage
await accountPage.navigateToOpenNewAccount();

const newAccountId = await accountPage.openCheckingAccount(sourceAccountId);

console.log('New Account ID:', newAccountId);
  // Step 9: Verify account details using REST API
  const newAccountResponse = await request.get(
    `https://parabank.parasoft.com/parabank/services/bank/accounts/${newAccountId}`
  );

  expect(newAccountResponse.status()).toBe(200);

  const newAccountData = parser.parse(
    await newAccountResponse.text()
  );

  const newAccount = newAccountData.account;

  expect(String(newAccount.id)).toBe(newAccountId);
  expect(newAccount.type).toBe('CHECKING');

  // ParaBank transfers minimum $100 during account creation
  const balanceInCents = Math.round(
    Number(newAccount.balance) * 100
  );

  expect(balanceInCents).toBe(10000);

  console.log('Account creation successful!');
  console.log('Verified account balance: $' + newAccount.balance);

  // Inspect Request Loan page


// Navigate to Request Loan page using LoanPage POM
const loanPage = new LoanPage(page);

await loanPage.navigate();

// Apply for loan using LoanPage POM
const loanAmount = 200;
const downPayment = 50;

const loanResponse = await loanPage.applyForLoan(
  loanAmount,
  downPayment,
  sourceAccountId
);

expect(loanResponse.status()).toBe(200);

const loanData = await loanResponse.json();

console.log('Loan API Response:', loanData);

// Verify loan approval
expect(loanData.approved).toBe(true);

const loanAccountId = String(loanData.accountId);

console.log('Loan Account ID:', loanAccountId);

// Verify loan approval using LoanPage POM
await loanPage.verifyLoanApproval(loanAccountId);

// Get loan account details using REST API
const loanAccountResponse = await request.get(
  `https://parabank.parasoft.com/parabank/services/bank/accounts/${loanAccountId}`
);

expect(loanAccountResponse.status()).toBe(200);

const loanAccountXml = await loanAccountResponse.text();
const loanAccountData = parser.parse(loanAccountXml);

console.log(
  'Loan Account Details:',
  JSON.stringify(loanAccountData, null, 2)
);

const loanAccount = loanAccountData.account;

// Verify loan account details
expect(String(loanAccount.id)).toBe(loanAccountId);
expect(loanAccount.type).toBe('LOAN');
expect(String(loanAccount.customerId)).toBe(customerId);

const loanBalanceCents = Math.round(
  Number(loanAccount.balance) * 100
);

expect(loanBalanceCents).toBe(loanAmount * 100);

console.log('Loan Account Balance:', loanAccount.balance);
console.log('Scenario A verification successful!');

// Scenario B - Navigate using TransferPage 
const transferPage = new TransferPage(page);

  await page.locator('body').innerText()

  await page.locator('input, select, button').evaluateAll(elements =>
    elements.map(element => ({
      tag: element.tagName,
      id: (element as HTMLInputElement).id,
      name: (element as HTMLInputElement).name,
      type: (element as HTMLInputElement).type,
      value: (element as HTMLInputElement).value,
      text: element.textContent?.trim()
    }))
);


// Scenario B - Transfer Funds

// Step 1: Capture initial source account balance
const sourceBalanceResponse = await request.get(
  `https://parabank.parasoft.com/parabank/services/bank/accounts/${sourceAccountId}`
);

expect(sourceBalanceResponse.status()).toBe(200);

const sourceBalanceData = parser.parse(
  await sourceBalanceResponse.text()
);

const initialBalanceCents = Math.round(
  Number(sourceBalanceData.account.balance) * 100
);

console.log('Initial Source Balance:', initialBalanceCents / 100);

// Step 2: Define all three transfers
const transferAmounts = ['150.00', '25.50', '8.99'];

// Step 3: Execute all transfers using TransferPage POM
for (const amount of transferAmounts) {

  // Navigate to Transfer Funds page
  await transferPage.navigate();

  const response = await transferPage.transferFunds(
    amount,
    sourceAccountId,
    newAccountId
  );

  console.log(
    `Transfer $${amount}:`,
    await response.text()
  );
}

console.log('All three transfers completed successfully!');


const transactionsPage = new TransactionsPage(page);
await transactionsPage.navigate();

  await page.locator('input, select, button').evaluateAll(elements =>
    elements.map(element => ({
      tag: element.tagName,
      id: (element as HTMLInputElement).id,
      name: (element as HTMLInputElement).name,
      type: (element as HTMLInputElement).type,
      value: (element as HTMLInputElement).value,
      text: element.textContent?.trim()
    }))
);

// Select original Checking account
await transactionsPage.searchByDateRange(
  sourceAccountId,
  '01-01-2020',
  '12-31-2030'
);

  await page.locator('body').innerText()

// Step 1: Read actual HTML table rows
const transactionRows = await transactionsPage.getTransactionRows();

// Step 2: Convert currency into integer cents
function toCents(currencyText: string): number {
  const amount = Number(currencyText.replace(/[$,]/g, ''));
  expect(Number.isFinite(amount)).toBe(true);
  return Math.round(amount * 100);
}

// Step 3: Expected transfers in integer cents
const expectedTransfers = [15000, 2550, 899];

// Step 4: Filter only intended transfers
const outgoingRows = transactionRows.filter(row => {
  const transactionType = row[1];
  const debitAmount = row[2];

  if (
    !transactionType ||
    !debitAmount ||
    !transactionType.includes('Funds Transfer Sent') ||
    !debitAmount.includes('$')
  ) {
    return false;
  }

  return expectedTransfers.includes(toCents(debitAmount));
});

// Extract actual transfer amounts
const actualTransferCents = outgoingRows.map(row =>
  toCents(row[2]!)
);

// Step 5: Verify all three transfers
expect(actualTransferCents).toHaveLength(3);

expect([...actualTransferCents].sort((a, b) => a - b))
  .toEqual([...expectedTransfers].sort((a, b) => a - b));

// Step 6: Calculate total outgoing amount
const totalOutgoingCents = actualTransferCents.reduce(
  (total, amount) => total + amount,
  0
);

const expectedDeductionCents = 18449;

expect(totalOutgoingCents).toBe(expectedDeductionCents);

console.log(
  'Total Outgoing Transfers: $' +
  (totalOutgoingCents / 100).toFixed(2)
);

// Step 7: Verify remaining balance using REST API
const finalBalanceResponse = await request.get(
  `https://parabank.parasoft.com/parabank/services/bank/accounts/${sourceAccountId}`
);

expect(finalBalanceResponse.status()).toBe(200);

const finalBalanceData = parser.parse(
  await finalBalanceResponse.text()
);

const finalBalanceCents = Math.round(
  Number(finalBalanceData.account.balance) * 100
);

expect(finalBalanceCents).toBe(
  initialBalanceCents - expectedDeductionCents
);

console.log(
  'Final Source Balance: $' +
  (finalBalanceCents / 100).toFixed(2)
);

console.log('Scenario B verification successful!');

});