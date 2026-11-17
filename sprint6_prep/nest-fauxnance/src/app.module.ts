import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { FauxnanceModule } from './fauxnance/fauxnance.module.js';

@Module({
  imports: [FauxnanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
