import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipAuth } from './helpers/allowPublicAccess';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @SkipAuth()
  async loadInitialData() {
    return this.appService.loadInitialData();
  }
}
