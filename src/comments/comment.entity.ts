import { Restaurant } from "src/restaurants/restaurant.entity";
import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CommentImage } from "./commentImage.entity";
import { CommentLike } from "./commentLike.entity";
import { CommentReply } from "./commentReply.entity";

export enum  CommentRating{
    GOOD = 'Good',
    NORMAL = 'Normal',
    BAD = 'Bad',
}
@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @Column()
    content: string;

    @OneToMany(() => CommentImage, image => image.id)
    images: CommentImage[]

    @OneToMany(() => CommentLike, like => like.id)
    likes: CommentImage[]

    @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.id)
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;
  
    @ManyToOne(() => User, (user: User) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type:'enum',
        enum: CommentRating,
        default: CommentRating.GOOD,
    })
    type: CommentRating;

    @OneToMany(() => CommentReply, comment => comment.id)
    reply: CommentReply[];

    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
}