import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { ListController } from './list.controller';
import { List } from './list.entity';
import { ListService } from './list.service';
import { ListItem } from './list_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      List,
      ListItem,
    ]),
    RestaurantsModule,
    CommentsModule,
  ],
  controllers: [ListController],
  providers: [ListService],
})
export class ListModule {}
