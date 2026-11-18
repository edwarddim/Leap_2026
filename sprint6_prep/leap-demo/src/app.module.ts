import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FauxnanceModule } from './fauxnance/fauxnance.module';

@Module({
  imports:[
    FauxnanceModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}