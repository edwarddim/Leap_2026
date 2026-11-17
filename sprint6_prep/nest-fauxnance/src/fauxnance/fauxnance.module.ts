import { HttpClientModule } from '@nestjs/http-client';
import { Module } from '@nestjs/common';
import { FauxnanceClientService } from './fauxnance-client.service.js';
import { FAUXNANCE_HTTP_CLIENT, loadFauxnanceConfig } from './fauxnance.config.js';
import { FauxnanceController } from './fauxnance.controller.js';

@Module({
  imports: [
    // A named client, injected with @InjectHttpClient('fauxnance').
    // registerAsync so the env vars are read after main.ts has loaded .env.
    HttpClientModule.registerAsync({
      name: FAUXNANCE_HTTP_CLIENT,
      useFactory: () => {
        const { baseUrl, timeoutMs } = loadFauxnanceConfig();
        return {
          baseUrl,
          timeout: timeoutMs,
          // Default retry policy: 3 attempts for GET/PUT/DELETE/HEAD/OPTIONS
          // on network errors, timeouts and 408/429/5xx. POST/PATCH are never retried.
          retry: 3,
        };
      },
    }),
  ],
  controllers: [FauxnanceController],
  providers: [FauxnanceClientService],
  exports: [FauxnanceClientService],
})
export class FauxnanceModule {}
