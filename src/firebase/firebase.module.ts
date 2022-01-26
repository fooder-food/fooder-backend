import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseService } from './firebase.service';
import { UserNotification } from './notification.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([UserNotification])
  ],
  providers: [FirebaseService, HttpModule],
  exports: [FirebaseService],
})
export class FirebaseModule {}
