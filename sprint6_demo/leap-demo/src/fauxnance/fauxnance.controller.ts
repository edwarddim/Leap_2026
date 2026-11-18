import { Controller, Get, Param } from '@nestjs/common';
import { FauxnanceService } from './fauxnance.service';

@Controller('fauxnance')
export class FauxnanceController {
    constructor(private readonly fauxService: FauxnanceService){}
    @Get()
    hello(){
        return "hello from Fauxnance";
    }

    // API CALL ROUTE
    @Get(':tag')
    search(
        @Param('tag') tag: string
    ){
        return this.fauxService.getHealth();
    }
}
