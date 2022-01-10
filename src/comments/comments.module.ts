import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentImage } from './commentImage.entity';
import { CommentLike } from './commentLike.entity';
import { CommentReply } from './commentReply.entity';
import { CommentsService } from './comments.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    TypeOrmModule.forFeature([ CommentImage]),
    TypeOrmModule.forFeature([ CommentLike]),
    TypeOrmModule.forFeature([ CommentReply]),],
  providers: [CommentsService,],
  exports:[CommentsService],
})
export class CommentsModule {}
