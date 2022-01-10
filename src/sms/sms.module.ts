import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { SmsService } from './sms.service';

@Module({
  imports:[UsersModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
