import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from 'src/category/category.module';
import { CommentsModule } from 'src/comments/comments.module';
import { FavoriteModule } from 'src/favorite/favorite.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationGateway } from './notification.gateway';
import { Restaurant } from './restaurant.entity';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
const MAO = require('multer-ali-oss');

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant]), 
    FirebaseModule,
    UsersModule,
    HttpModule,
    CategoryModule,
    FavoriteModule,
    CommentsModule,
    MulterModule.registerAsync({
      useFactory() {
        return {
          storage: MAO({
            config: {
              region: process.env.OSS_REGION,
              accessKeyId: process.env.OSS_ACCESS_KEY_ID,
              accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
              bucket: process.env.OSS_BUCKET,
            },
          })
        }
      }
    })
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, NotificationGateway],
  exports: [RestaurantsService]
})
export class RestaurantsModule {}
