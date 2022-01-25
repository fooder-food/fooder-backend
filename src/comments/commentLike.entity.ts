
import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comment } from "./comment.entity";


@Entity()
export class CommentLike extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @ManyToOne(()=> Comment, comment => comment.id)
    comment: Comment;
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({name: 'user_id'})
    user: User
      
    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
}