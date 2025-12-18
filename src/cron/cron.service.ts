import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  // Chạy mỗi 13 phút
  @Cron('*/13 * * * *')
  handleCron() {
    console.log('hello cron');
    this.logger.log('hello cron');
  }
}
