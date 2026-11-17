import { All, Body, Controller, Get, Headers, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { FauxnanceClientService, type HttpMethod } from './fauxnance-client.service.js';

@Controller('fauxnance')
export class FauxnanceController {
  constructor(private readonly fauxnance: FauxnanceClientService) {}

  @Get()
  info() {
    return { message: 'Fauxnance proxy is up. Call /fauxnance/<path> to forward a request.' };
  }

  /**
   * Forwards any request under /fauxnance/* to the Fauxnance API via FauxnanceClientService.
   *   GET /fauxnance/accounts?limit=5  ->  GET {FAUXNANCE_BASE_URL}/accounts?limit=5
   * The Authorization header is passed through so token-protected routes work.
   */
  @All('*path')
  forward(
    @Req() req: Request,
    @Param('path') path: string | string[],
    @Query() query: Record<string, string>,
    @Body() body: unknown,
    @Headers('authorization') authorization?: string,
  ) {
    const upstreamPath = Array.isArray(path) ? path.join('/') : path;
    const method = req.method.toUpperCase() as HttpMethod;
    const hasBody =
      !['GET', 'DELETE'].includes(method) &&
      body !== undefined &&
      Object.keys(body as object).length > 0;

    return this.fauxnance.request(upstreamPath, {
      method,
      query,
      body: hasBody ? body : undefined,
      headers: authorization ? { Authorization: authorization } : {},
    });
  }
}
