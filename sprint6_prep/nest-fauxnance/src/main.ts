import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Load variables from .env if it exists (built into Node 20.12+).
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on real environment variables.
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
