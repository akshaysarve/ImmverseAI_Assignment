# Engineering Decisions

## 1. Test Data Management, Database Reset and Concurrency

ParaBank provides database reset operations such as `cleanDB` and `initializeDB`. These operations affect the shared application database and can remove or modify data used by other tests or users.

**Decision:**
- Do not execute global database reset operations against the publicly hosted ParaBank instance.
- Use dynamically generated usernames to avoid registration conflicts.
- Keep Playwright workers set to `1` when executing tests against the shared environment.
- Avoid running destructive tests concurrently against shared test data.
- For CI execution, prefer a dedicated ParaBank instance with an isolated database.
- Perform database initialization only in an isolated test environment where the test suite has exclusive control.

Unique usernames reduce registration conflicts but do not prevent conflicts caused by global database resets or shared account modifications.

## 2. Financial Calculations and Floating-Point Precision

JavaScript uses floating-point numbers, which can introduce precision issues when performing financial calculations.

For example, adding decimal currency values directly can produce unexpected results.

**Decision:**
- Convert currency amounts into integer cents before performing calculations.
- Remove currency symbols and commas when parsing transaction amounts.
- Use `Math.round()` when converting decimal currency values into cents.
- Compare expected and actual transaction totals using integer arithmetic.

Example:

```typescript
const toCents = (amount: string): number => {
  return Math.round(
    Number(amount.replace(/[$,]/g, '')) * 100
  );
};

const expectedDeduction = 15000 + 2550 + 899;

expect(actualDeduction).toBe(expectedDeduction);
```

This approach avoids floating-point precision problems during financial validation.

## 3. API Testing vs UI Testing

API and UI testing serve different purposes. Both are required to validate the application effectively.

**API testing is used for:**
- Validating backend operations and HTTP response status codes.
- Retrieving customer, account and transaction information.
- Verifying response structure and data types.
- Performing deposits and validating transaction history.
- Reducing dependency on browser interactions for backend checks.

**UI testing is used for:**
- Validating customer registration workflows.
- Opening new bank accounts through the application interface.
- Applying for loans and verifying approval status.
- Performing fund transfers through the user interface.
- Searching transactions and validating displayed results.

**Decision:**

Use API requests for test preconditions and backend data validation wherever appropriate. Use UI automation to validate important user journeys and visible application behavior.

This approach improves test coverage while reducing unnecessary browser interactions.

## 4. Public API Limitations

The publicly available ParaBank REST API specification does not expose a customer-creation endpoint.

**Decision:**
- Use the existing seeded demo customer for the headless API deposit and transaction-history test.
- Validate the API response against a predefined TypeScript transaction interface.
- Document this limitation rather than claiming that customer creation through the REST API has been implemented.
- A dedicated environment with an additional customer-creation API would be required to satisfy that part of the original scenario fully.
