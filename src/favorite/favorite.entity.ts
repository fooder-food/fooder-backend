import { Restaurant } from "src/restaurants/restaurant.entity";
import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('favorite')
export class Favorite extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @Column({default: true })
    isActive: boolean;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({
        name: 'userId'
    })
    user: number;
  
    @ManyToOne(() => Restaurant, restaurant => restaurant.id)
    @JoinColumn({
        name: 'restaurantId'
    })
    restaurant: number;
      
}
