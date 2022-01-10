
import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class SearchHistory extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({unique: true})
    uniqueId: string;

    @Column()
    historyName: string;

    @Column()
    restaurantUniqueId: string;

    @Column({default: true})
    isActive: boolean;

    @ManyToOne(() => User, user => user.id)
    createdBy: User;

    @CreateDateColumn()
    createDate: string;
  
    @UpdateDateColumn()
    updateDate: string;
}