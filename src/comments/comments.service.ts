import { Injectable, Put } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentRating } from './comment.entity';
import { CommentImage } from './commentImage.entity';
import { CommentLike } from './commentLike.entity';
import { CommentReply } from './commentReply.entity';
import { v4 as uuidv4 } from 'uuid';
import { AddCommentDto } from 'src/restaurants/dto/add-comment.dto';
import { async } from 'rxjs';
import { User } from 'src/users/users.entity';
import { UpdateCommentDto } from 'src/restaurants/dto/update-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(CommentImage)
        private readonly commentImageRepository: Repository<CommentImage>,
        @InjectRepository(CommentLike)
        private readonly commentLikeRepository: Repository<CommentLike>,
        @InjectRepository(CommentReply)
        private readonly commentReplyRepository: Repository<CommentReply>,
    ) {}

    async create(addCommentDto: AddCommentDto) {
        let type = CommentRating.GOOD;
        if(addCommentDto.type == 1) {
            type = CommentRating.NORMAL;
        } else if (addCommentDto.type == 2) {
            type = CommentRating.BAD;
        }
       const commentModel =  await this.commentRepository.create({
            uniqueId: uuidv4(),
            content: addCommentDto.content,
            type: type,
            restaurant: addCommentDto.restaurant,
            user: addCommentDto.user,
        });
        const comment = await this.commentRepository.save(commentModel);

        addCommentDto.photos.forEach(async (photo) => {
           const image =  await this.commentImageRepository.create({
                uniqueId: uuidv4(),
                imageUrl: photo.url,
                comment: comment,
            });

            await this.commentImageRepository.save(image);

        });
     
        return {
            message: 'create success',
            ...comment,
            photos: addCommentDto.photos,
            
        }
    }

    async getCommentByUniqueId(uniqueId: string) {
        return this.commentRepository.findOne({
            where: {
                uniqueId,
            },
            relations: ['restaurant',],
        });
    } 

    async getCommentImage(comment: Comment) {
        return this.commentImageRepository.find({
            where: {
                comment,
            }
        });
    }

    async delComment(id: number) {
        return this.commentRepository.delete({
            id
        });
    }

    async delCommentImage(id: number) {
        return this.commentImageRepository.delete({
            id,
        });
    } 

    async delCommentImageByCommentId(comment: Comment) {
        return this.commentImageRepository.delete({
            comment,
        });
    }

    async update(updateCommentDto: UpdateCommentDto, photos: any[]) {
        const comment = await this.commentRepository.findOne({
            uniqueId: updateCommentDto.commentUniqueId,
        });

        let type = CommentRating.GOOD;
        if(updateCommentDto.type.toUpperCase() === "NORMAL") {
            type = CommentRating.NORMAL;
        } else if (updateCommentDto.type.toUpperCase() === "BAD") {
            type = CommentRating.BAD;
        }

        comment.content = updateCommentDto.content;
        comment.type = type;
        await this.commentRepository.update(comment.id, comment);
        photos.forEach(async (photo) => {
            const image =  await this.commentImageRepository.create({
                 uniqueId: uuidv4(),
                 imageUrl: photo.url,
                 comment: comment,
             });
 
             await this.commentImageRepository.save(image);
 
         });
         return {
            message: 'create success',
        }

    }


    async getAll() {
        return this.commentRepository.find({
            relations: ['restaurant'],
        });
    }

    async getByRestaurantIdWithType(id: number, type: number) {
        let getType = CommentRating.GOOD;
        if(type == 2) {
            getType = CommentRating.NORMAL;
        } else if (type == 3) {
            getType = CommentRating.BAD;
        }
        console.log(getType);
        let comments: any = await this.commentRepository.createQueryBuilder('comment')
        .leftJoin('comment.user', 'user')
        .select(['comment.id', 'comment.uniqueId','comment.content', 'comment.type', 
        'comment.updateDate', 'comment.createDate', 'user.uniqueId', 'user.id', 'user.username', 'user.email', 
        'user.avatar', 'user.avatarType', 'user.createDate', 'user.updateDate',

        ])
        .where(`comment.restaurant_id=:id${type  > 0 ? ' AND comment.type=:getType': ''}`,{
            id,
            getType,
        })
        .getMany();

        comments = await Promise.all(comments.map(async (comment: Comment) => {
            const likeTotal = await this.commentLikeRepository.findAndCount({
                where: {
                    comment: comment.id,
                }
            });
            const replyTotal = await this.commentReplyRepository.findAndCount({
                where: {
                    comment: comment,
                },
                relations: ['user'],
                order: {
                    createDate: 'ASC',
                }
            })
            return {
                ...comment,
                likeTotal: likeTotal[1],
                likesList: likeTotal[0],
                replyTotal: replyTotal[1],
                replyList: replyTotal[0],
            }
        }));
      return comments;
    }

    async getByrestaurantId(id: number) {

        let comments: any = await this.commentRepository.createQueryBuilder('comment')
        .leftJoin('comment.user', 'user')
        .select(['comment.id', 'comment.uniqueId','comment.content', 'comment.type', 
        'comment.updateDate', 'comment.createDate', 'user.uniqueId', 'user.id', 'user.username', 'user.email', 
        'user.avatar', 'user.avatarType', 'user.createDate', 'user.updateDate',

        ])
        .where('comment.restaurant_id=:id',{
            id,
        })
        .getMany();

        comments = await Promise.all(comments.map(async (comment: Comment) => {
            const likeTotal = await this.commentLikeRepository.findAndCount({
                where: {
                    comment: comment.id,
                }
            });
            const replyTotal = await this.commentReplyRepository.findAndCount({
                where: {
                    comment: comment,
                },
                relations: ['user'],
                order: {
                    createDate: 'ASC',
                }
            })
            return {
                ...comment,
                likeTotal: likeTotal[1],
                likesList: likeTotal[0],
                replyTotal: replyTotal[1],
                replyList: replyTotal[0],
            }
        }));
      return comments;
    }

    async getImageById(id: number) {
        return this.commentImageRepository.find({
            where: {
                comment: id,
            }
        })
    }

    async getAllCommentImage() {
        return this.commentImageRepository.find({
            take: 5,
            order: {
                'createDate': 'DESC'
            },
        });
    }

    async getAllCommentLikeById(comment: Comment ) {
        return this.commentLikeRepository.find({
            where: {
                comment,
            },
            relations: ['user']
        })
    }

    async checkCommentLikeIsExist(user: User, comment: Comment) {
        return this.commentLikeRepository.find({
            where: {
                user,
                comment,
            } 
        });
    }

    async addCommentLike(comment: Comment, user:User) {
        console.log(comment);
        const like =  this.commentLikeRepository.create({
            uniqueId: uuidv4(),
            comment,
            user,
        });

        return this.commentLikeRepository.save(like);
    }

    async delCommentLike(user: User, comment: Comment) {
        return this.commentLikeRepository.delete({
            user,
            comment,
        });
    }

    async delCommentlikeByComment(comment: Comment) {
        return this.commentLikeRepository.delete({
            comment,
        });
    }
}
