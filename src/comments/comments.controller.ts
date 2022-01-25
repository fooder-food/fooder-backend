import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CommentsService } from './comments.service';
import { SetCommentLikeDto } from './dto/setCommentLike.dto';

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentService: CommentsService,
    ){}

    @Get(':id')
    async getCommentInfo(@Param('id') id) {
        const comment = await this.commentService.getCommentByUniqueId(id);
        const images = await this.commentService.getCommentImage(comment);
        return {
            ...comment,
            images,
        }
    }
    
}
