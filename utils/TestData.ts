import type { RegistrationData } from '../pages/RegistrationPage.js';

export function generateRegistrationData(): RegistrationData {
  const uniqueId = Date.now().toString();

  return {
    firstName: 'Test',
    lastName: 'Automation',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    phoneNumber: '9876543210',
    ssn: uniqueId.slice(-9),
    username: `qauser_${uniqueId}`,
    password: 'Test@12345'
  };
}
