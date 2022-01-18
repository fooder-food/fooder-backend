
import { Restaurant } from "src/restaurants/restaurant.entity";
import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { List } from "./list.entity";

@Entity()
export class ListItem extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @Column("int")
    order: number;

    @ManyToOne(() => List, (list: List) => list.id)
    @JoinColumn({ name: 'collection_list_id' })
    list: List;

    @ManyToOne(() => Restaurant, restaurant => restaurant.id)
    @JoinColumn({ name: 'restaurant_id' })
    restaurants: Restaurant

    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
}