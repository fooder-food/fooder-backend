import { Category } from 'src/category/category.entity';
import { Comment } from 'src/comments/comment.entity';
import { CommentLike } from 'src/comments/commentLike.entity';
import { CommentReply } from 'src/comments/commentReply.entity';
import { UserNotification } from 'src/firebase/notification.entity';
import { SearchHistory } from 'src/history/history.entity';
import { List } from 'src/list/list.entity';
import { Report } from 'src/report/report.entity';
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

  @Column({ default: true })
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

  @OneToMany(()=> CommentLike, like => like.id)
  likes: CommentLike[];


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

  @OneToMany(() => UserNotification, notification => notification.id)
  notifications: UserNotification[]

  @OneToMany(() => Report, report => report.id)
  reports: Report[]

  @OneToMany(() => List, list => list.id)
  list: List[]

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