import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from 'src/users/users.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { ReportModule } from 'src/report/report.module';

@Module({
  providers: [
    AdminService,
    //UsersModule,
    RestaurantsModule,
   // ReportModule,
  ],
  controllers: [AdminController]
})
export class AdminModule {}
