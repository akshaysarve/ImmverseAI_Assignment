
import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../../../utils/ApiClient.js';

type ApiFixtures = {
  api: ApiClient;
};

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    const apiClient = new ApiClient(request);

    await use(apiClient);
  }
});

export { expect };
