import { Injectable } from '@nestjs/common';
import { HttpClient } from '@nestjs/http-client';

@Injectable()
export class FauxnanceService {
    constructor(private readonly http: HttpClient){}

    async getHealth(){
        const response = await this.http.get('/health');
        return response.data;
    }
}
