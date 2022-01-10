import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { FavoriteService } from './favorite.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([Favorite])
  ],
  providers: [FavoriteService],
  exports: [FavoriteService],
})
export class FavoriteModule {}
