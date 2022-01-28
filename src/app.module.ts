import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { SmsModule } from './sms/sms.module';
import { CategoryModule } from './category/category.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { FirebaseModule } from './firebase/firebase.module';
import { HttpModule } from '@nestjs/axios';
import { FavoriteModule } from './favorite/favorite.module';
import { CommentsModule } from './comments/comments.module';
import { HistoryModule } from './history/history.module';
import { ListModule } from './list/list.module';
import { ReportModule } from './report/report.module';
@Module({
  imports: [
    SharedModule,
    UsersModule,
    AdminModule,
    UploadsModule,
    AuthModule,
    SmsModule,
    CategoryModule,
    RestaurantsModule,
    FirebaseModule,
    HttpModule,
    FavoriteModule,
    CommentsModule,
    HistoryModule,
    ListModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService, HttpModule],
})
export class AppModule {}
