import { Controller, Get, HostParam, Post,} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    ) {}

  @Get()
  getHello(@HostParam('origin') origin): string {
    return this.appService.getHello();
  }


}
