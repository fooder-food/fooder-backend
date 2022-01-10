
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comment } from "./comment.entity";


@Entity()
export class CommentLike extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @ManyToOne(()=> Comment, comment => comment.id)
    comment: number;
      
    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
}