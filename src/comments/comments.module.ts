import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentImage } from './commentImage.entity';
import { CommentLike } from './commentLike.entity';
import { CommentReply } from './commentReply.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    TypeOrmModule.forFeature([ CommentImage]),
    TypeOrmModule.forFeature([ CommentLike]),
    TypeOrmModule.forFeature([ CommentReply]),],
  providers: [CommentsService,],
  exports:[CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
