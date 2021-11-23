import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    SharedModule,
    UsersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
