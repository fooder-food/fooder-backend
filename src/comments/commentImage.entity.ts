
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comment } from "./comment.entity";


@Entity()
export class CommentImage extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @Column()
    imageUrl: string;

    @ManyToOne(()=> Comment, comment => comment.id)
    @JoinColumn({ name: 'comment_id' })
    comment: Comment;
      
    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
}