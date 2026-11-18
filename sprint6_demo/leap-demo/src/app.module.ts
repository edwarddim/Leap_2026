import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FauxnanceModule } from './fauxnance/fauxnance.module';

@Module({
    controllers:[AppController],
    imports: [FauxnanceModule]
})
export class AppModule {}