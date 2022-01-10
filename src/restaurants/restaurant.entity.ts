import { Category } from "src/category/category.entity";
import { Comment } from "src/comments/comment.entity";
import { Favorite } from "src/favorite/favorite.entity";
import { User } from "src/users/users.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum  RestaurantStatus{
    PENDING = 'pending',
    APPROVE = 'approve',
    REJECT = 'reject',
}

@Entity()
export class Restaurant extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column({unique: true})
    uniqueId: string;

    @Column()
    restaurantName: string;

    @Column()
    geo: string

    @Column()
    address: string

    @Column()
    pricePerson: string;

    @Column()
    website: string;

    @Column()
    businessHour: string;

    @Column({default: ''})
    breakTime: string;

    @Column({ default: '' })
    restaurantPhone: string;

    @Column({default: ''})
    country: string;

    @Column({default: ''})
    countryAlias: string;
    
    
    @Column({default: ''})
    state: string;

    @Column({default: ''})
    stateAlias: string;

    @ManyToOne(() => Category, category => category.id)
    @JoinColumn({ name: 'category_id' })
    selectedCategory: Category;

    @Column({
        type: 'enum',
        enum: RestaurantStatus,
        default: RestaurantStatus.PENDING,
    })
    status: string

    @Column({default: ''})
    placeId: string;

    @Column({default: 0})
    view: number;

    @ManyToOne(() => User, user => user.id)
    createBy: User;

    @OneToMany(() => Favorite,  favorite => favorite.id) 
    // @JoinTable({name: 'favorite'}) 
    followBy: Favorite[]

    @OneToMany(() => Comment, comment => comment.id)
    @JoinColumn()
    comments: Comment[]

    // @ManyToMany(() => Comment,  comment => comment.id) 
    // @JoinTable({name: 'comment'})
    // comments: Comment[]

    
    @CreateDateColumn()
    createDate: string
  
    @UpdateDateColumn()
    updateDate: string
}