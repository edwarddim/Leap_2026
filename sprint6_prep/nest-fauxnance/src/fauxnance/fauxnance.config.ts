/** Name of the @nestjs/http-client client used for the Fauxnance API. */
export const FAUXNANCE_HTTP_CLIENT = 'fauxnance';

export interface FauxnanceConfig {
  /** Base URL of the Fauxnance API, e.g. http://localhost:8080 */
  baseUrl: string;
  /** Per-attempt request timeout in milliseconds */
  timeoutMs: number;
}

export function loadFauxnanceConfig(): FauxnanceConfig {
  return {
    baseUrl: (process.env.FAUXNANCE_BASE_URL ?? 'http://localhost:8080').replace(/\/+$/, ''),
    timeoutMs: Number(process.env.FAUXNANCE_TIMEOUT_MS ?? 10_000),
  };
}
