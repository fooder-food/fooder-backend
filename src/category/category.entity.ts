import { Restaurant } from "src/restaurants/restaurant.entity";
import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({unique: true})
    uniqueId: string;

    @Column()
    categoryName: string;

    @Column()
    categoryIcon: string;

    @Column({default: true})
    isActive: boolean;

    @ManyToOne(() => User, user => user.id)
    createdBy: User;

    @OneToMany(() => Restaurant, restaurant => restaurant.id)
    selectedCategory: Restaurant;

    @CreateDateColumn()
    createDate: string;
  
    @UpdateDateColumn()
    updateDate: string;
}