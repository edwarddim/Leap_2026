import { Module } from '@nestjs/common';
import { HttpClientModule } from '@nestjs/http-client';
import { FauxnanceController } from './fauxnance.controller';
import { FauxnanceService } from './fauxnance.service';

@Module({
  imports:[
    HttpClientModule.register({
      baseUrl:'https://api.fauxnance.neueda.com/v1',
      timeout:'10s'
    })
  ],
  controllers: [FauxnanceController],
  providers: [FauxnanceService]
})
export class FauxnanceModule {}
