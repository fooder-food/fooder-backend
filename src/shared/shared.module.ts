import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from 'src/db/db.module';
import { UploadsModule } from 'src/uploads/uploads.module';
import { SharedController } from './shared.controller';
import { SharedService } from './shared.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    UploadsModule,
  ],
  controllers: [SharedController],
  providers: [SharedService]
})
export class SharedModule {}
