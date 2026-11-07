
import type {
  APIRequestContext,
  APIResponse
} from '@playwright/test';

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext
  ) {}


async get(endpoint: string): Promise<APIResponse> {
  return await this.request.get(endpoint, {
    headers: {
      Accept: 'application/json'
    }
  });
}

async post(endpoint: string, data?: Record<string, unknown>): Promise<APIResponse> {
  return await this.request.post(endpoint, {
    data,
    headers: {
      Accept: 'application/json'
    }
  });
}


  async put(
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<APIResponse> {
    return await this.request.put(endpoint, {
      data
    });
  }

  async delete(endpoint: string): Promise<APIResponse> {
    return await this.request.delete(endpoint);
  }
}
