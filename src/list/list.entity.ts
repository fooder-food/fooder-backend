
import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ListItem } from "./list_item.entity";

@Entity()
export class List extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @ManyToOne(() => User, (user: User) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => ListItem, item => item.id)
    items: ListItem[]

    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
}