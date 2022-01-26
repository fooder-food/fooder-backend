import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

enum NotificationType {
    RESTAURANT = 'restaurant'
}
@Entity('notification')
export class UserNotification extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @Column({default: false })
    isRead: boolean;

    @Column()
    content: string;

    @Column()
    icon: string;

    @Column()
    params: string;

    @Column()
    type: string;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({
        name: 'user_id'
    })
    user: User;

    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
      
}
