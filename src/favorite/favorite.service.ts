import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFavoriteDto } from './dto/create_favorite.dto';
import { Favorite } from './favorite.entity';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/users.entity';

@Injectable()
export class FavoriteService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepository: Repository<Favorite>
    ) {}

    async create(createFavoriteDto: CreateFavoriteDto, user: User) {
        const favoriteModel = this.favoriteRepository.create({
            ...createFavoriteDto,
            uniqueId: uuidv4(),
            user,
        });
        const favorite = await this.favoriteRepository.save(favoriteModel);
        return favorite;
    }

    async getFavoriteByUser( user: User) {
        return this.favoriteRepository.find({
            where: {
                user: user.id,
            },
            relations: ["restaurant"]
        })
    };

    async getByRestaurantId(restaurantId: number) {
        return this.favoriteRepository.query(`SELECT user.uniqueId, user.username, user.email, user.phoneNumber, 
        user.userType, user.avatar, user.avatarType, favorite.uniqueId as favoriteUniqueId FROM favorite 
        LEFT JOIN user ON favorite.userId = user.id WHERE favorite.restaurantId= ?`, [restaurantId]);
    }

    async delete(uniqueId: string) {
        return this.favoriteRepository.delete({
            uniqueId,           
        })
    }
}
