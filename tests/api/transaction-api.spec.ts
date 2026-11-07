import { test, expect } from './fixtures/api.fixture.js';
import type { Transaction } from '../../types/Transaction.js';

test('API should deposit funds and validate transaction history', async ({ api }) => {

  const accountId = 12456;
  const depositAmount = 25.50;

  // Step 1: Deposit funds
  const depositResponse = await api.post(
    `services/bank/deposit?accountId=${accountId}&amount=${depositAmount}`
  );

  expect(depositResponse.status()).toBe(200);

  // Step 2: Retrieve transaction history
  const historyResponse = await api.get(
    `services/bank/accounts/${accountId}/transactions`
  );

  expect(historyResponse.status()).toBe(200);

  const transactions: Transaction[] = await historyResponse.json();

  // Step 3: Validate response structure
  expect(Array.isArray(transactions)).toBe(true);
  expect(transactions.length).toBeGreaterThan(0);

  for (const transaction of transactions) {
    expect(Object.keys(transaction).sort()).toEqual([
      'accountId',
      'amount',
      'date',
      'description',
      'id',
      'type'
    ]);

    expect(typeof transaction.id).toBe('number');
    expect(typeof transaction.accountId).toBe('number');
    expect(typeof transaction.date).toBe('number');
    expect(typeof transaction.amount).toBe('number');
    expect(typeof transaction.description).toBe('string');
    expect(['Credit', 'Debit']).toContain(transaction.type);
  }

  // Step 4: Verify the deposited transaction
  const depositedTransaction = transactions.find(
    transaction =>
      transaction.description === 'Deposit via Web Service' &&
      transaction.amount === depositAmount
  );

  expect(depositedTransaction).toBeDefined();
  expect(depositedTransaction?.accountId).toBe(accountId);

  console.log('API deposit and transaction validation successful!');
  console.log('Transaction ID:', depositedTransaction?.id);
});
