import { Injectable } from '@nestjs/common';
import { HttpClient } from '@nestjs/http-client';

@Injectable()
export class FauxnanceService {
  constructor(private readonly http: HttpClient) {}

  // GET {baseUrl}/health -> https://api.fauxnance.neueda.com/v1/health
  async getHealth() {
    const response = await this.http.get('/health');
    return response.data;
  }
}
