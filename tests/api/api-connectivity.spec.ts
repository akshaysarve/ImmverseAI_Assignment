
import { test, expect } from '@playwright/test';
import { XMLParser } from 'fast-xml-parser';
import type { Customer } from '../../types/Customer.js';

test('ParaBank API should return valid customer details', async ({ request }) => {

  const response = await request.get(
    'https://parabank.parasoft.com/parabank/services/bank/login/john/demo'
  );

  expect(response.status()).toBe(200);

  // Parse XML response
  const xmlData = await response.text();

  const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false
});

  const parsedData = parser.parse(xmlData);

  const customer: Customer = parsedData.customer;

  // Exact customer schema validation
  expect(Object.keys(customer).sort()).toEqual([
    'address',
    'firstName',
    'id',
    'lastName',
    'phoneNumber',
    'ssn'
  ].sort());

  // Validate data types
  expect(typeof customer.id).toBe('string');
  expect(Number(customer.id)).toBeGreaterThan(0);  
  expect(typeof customer.firstName).toBe('string');
  expect(typeof customer.lastName).toBe('string');
  expect(typeof customer.phoneNumber).toBe('string');
  expect(typeof customer.ssn).toBe('string');

  // Validate address schema
  expect(Object.keys(customer.address).sort()).toEqual([
    'street',
    'city',
    'state',
    'zipCode'
  ].sort());

  expect(typeof customer.address.street).toBe('string');
  expect(typeof customer.address.city).toBe('string');
  expect(typeof customer.address.state).toBe('string');
  expect(typeof customer.address.zipCode).toBe('string');

  // Validate required values
  expect(Number(customer.id)).toBeGreaterThan(0);  
  expect(customer.firstName.length).toBeGreaterThan(0);
  expect(customer.lastName.length).toBeGreaterThan(0);

  console.log('Customer ID:', customer.id);
  console.log('Customer Name:', customer.firstName, customer.lastName);
});
