import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthCredentialsDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: AuthCredentialsDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() dto: AuthCredentialsDto) {
    return this.authService.signIn(dto.username, dto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
