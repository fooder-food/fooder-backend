import { Category } from 'src/category/category.entity';
import { Comment } from 'src/comments/comment.entity';
import { CommentReply } from 'src/comments/commentReply.entity';
import { SearchHistory } from 'src/history/history.entity';
import { Restaurant } from 'src/restaurants/restaurant.entity';
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CreateUseType } from './dto/create-user.dto';
export enum UserType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({unique: true})
  uniqueId: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column({select: false})
  password: string;

  @Column({ default: false })
  isActive: boolean;
  
  @Column({
    type: 'enum',
    enum: CreateUseType,
  })
  registerType: string;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  userType: string;

  @Column({default: ''})
  avatar: string;

  @Column({default: ''})
  avatarType: string;
  @Column({default: ''})
  deviceToken: string

  @OneToMany(()=> Category, categories => categories.id)
  categories: Category[];

  @OneToMany(()=> SearchHistory, history => history.id)
  searchHistory: SearchHistory[];

  @OneToMany(() => Restaurant,  restaurant => restaurant.id)
  //@JoinTable({name: 'favorite'})  
  followRestaurant: Restaurant[]

  // @ManyToMany(() => Comment,  comment => comment.id)
  // @JoinTable({name: 'comment'})
  // comment: Comment[]

  @OneToMany(() => Comment, comment => comment.id)
  comments: Comment[]

  @OneToMany(() => CommentReply, comment => comment.id)
  replyComment: CommentReply[]

  @Column({ default: false })
  isPhoneConfirmed: boolean;

  @CreateDateColumn()
  createDate: string

  @UpdateDateColumn()
  updateDate: string

//   @BeforeInsert()
//   private hashPassword() {
//       if (this.password) {
//           this.password = hashSync(this.password);
//       }
//   }
}