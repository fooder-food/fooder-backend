import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { SearchHistoryDto } from './dto/create-history.dto';
import { SearchHistory } from './history.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HistoryService {

    constructor(
        @InjectRepository(SearchHistory)
        private readonly searchHistoryRepository: Repository<SearchHistory>,
    ) {}

    async create(searchHistoryDto: SearchHistoryDto, user:User) {
       const historyModel = await this.searchHistoryRepository.create({
           uniqueId: uuidv4(),
           historyName: searchHistoryDto.title,
           restaurantUniqueId:searchHistoryDto.restaurantUniqueId,
           createdBy: user,
       });
       return this.searchHistoryRepository.save(historyModel);
    }

    async getAll(user:User) {   
        return this.searchHistoryRepository.find({
            createdBy: user,
        });
    }

    async findByRestaurantUniqueId(id: string) {
        return this.searchHistoryRepository.findOne({
            where: {
                restaurantUniqueId: id,
            }
        })
    }
}
