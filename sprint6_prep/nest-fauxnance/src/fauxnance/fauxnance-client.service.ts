import { HttpClient, InjectHttpClient, toHttpException } from '@nestjs/http-client';
import { Injectable, Logger } from '@nestjs/common';
import { FAUXNANCE_HTTP_CLIENT } from './fauxnance.config.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
}

type NoBodyOptions = Omit<RequestOptions, 'method' | 'body'>;

/**
 * Talks to the Fauxnance API through the named `fauxnance` client from
 * @nestjs/http-client. Base URL, timeout and retries are configured once in
 * FauxnanceModule.
 */
@Injectable()
export class FauxnanceClientService {
  private readonly logger = new Logger(FauxnanceClientService.name);

  constructor(@InjectHttpClient(FAUXNANCE_HTTP_CLIENT) private readonly http: HttpClient) {}

  get<T>(path: string, options: NoBodyOptions = {}) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options: NoBodyOptions = {}) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  put<T>(path: string, body?: unknown, options: NoBodyOptions = {}) {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  patch<T>(path: string, body?: unknown, options: NoBodyOptions = {}) {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  delete<T>(path: string, options: NoBodyOptions = {}) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  async request<T>(
    path: string,
    { method = 'GET', body, headers = {}, query }: RequestOptions = {},
  ): Promise<T> {
    // Relative paths are joined onto the client's baseUrl.
    const url = path.replace(/^\/+/, '');
    this.logger.debug(`${method} /${url}`);

    try {
      const response = await this.http.request<T>(url, {
        method,
        query,
        json: body, // serialized with JSON.stringify, sets content-type
        headers: { accept: 'application/json', ...headers },
      });
      return response.data;
    } catch (err) {
      // Typed client errors -> Nest exceptions:
      //   HttpResponseError -> upstream status + body (forward: true)
      //   HttpTimeoutError  -> 504
      //   HttpNetworkError / HttpParseError -> 502
      throw toHttpException(err, { forward: true });
    }
  }
}
