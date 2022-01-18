import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentRating } from 'src/comments/comment.entity';
import { CommentsService } from 'src/comments/comments.service';
import { SearchRestaurantDto } from 'src/restaurants/dto/search-restaurant.dto';
import { Restaurant } from 'src/restaurants/restaurant.entity';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateListDto } from './dto/create-list.dto';
import { SearchListItemRestaurantDto } from './dto/search-list-item-restaurant.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './list.entity';
import { ListItem } from './list_item.entity';

@Injectable()
export class ListService {
    constructor(
        @InjectRepository(List)
        private readonly listRepository: Repository<List>,
        @InjectRepository(ListItem)
        private readonly listItemRepository: Repository<ListItem>,
        private readonly restaurantService: RestaurantsService,
        private readonly commentService: CommentsService,
    ) {}

    async createList(createListDto: CreateListDto, user: User) {
        const listModel = this.listRepository.create({
            uniqueId: uuidv4(),
            title: createListDto.title,
            description: createListDto.description,
            user,
        });

        return this.listRepository.save(listModel);
    }

    async getAllListByUser(user: User) {
        return this.listRepository.find({
            order: {
                createDate: 'ASC',
            },
            where: {
                user,
            }
        })
    }

    async updateListByUniqueId(updateListDto: UpdateListDto) {
        const collectionList = await this.listRepository.findOne({
            where: {
                uniqueId: updateListDto.uniqueId,
            }
        });
        collectionList.title = updateListDto.title;
        collectionList.description = updateListDto.description;
        return this.listRepository.update(collectionList.id, collectionList);
    }

    async getListById(id: number) {
        return this.listRepository.findOne({
            where: {
                id,
            }
        });
    }

    async getCollectionListByUniqueId(uniqueId: string) {
        return this.listRepository.findOne({
            where: {
                uniqueId: uniqueId,
            }
        });
    }

    async createListItem(restaurant: Restaurant, collectionList: List, order: number) {
        const listItemModel = this.listItemRepository.create({
            uniqueId: uuidv4(),
            restaurants: restaurant,
            list: collectionList,
            order,
        })
        return this.listItemRepository.save(listItemModel);
    }

    async getListItemByCollectionListUniqueId(list: List) {
        const itemList = await this.listItemRepository.find({
            where: {
                list,
            },
            relations: ['restaurants']
        });
        const items = await Promise.all(itemList.map(async (item) => {
            const restaurant = {...item.restaurants};
            const comments = await this.commentService.getByrestaurantId(restaurant.id);
            let [good,normal, bad] = [0,0,0];
            comments.forEach((item) => {
                if(item.type === CommentRating.GOOD) {
                    good++;
                } else if (item.type === CommentRating.NORMAL) {
                    normal++;
                }else {
                    bad++;
                }
            })
            const rating = this.restaurantService.calculateRating(Number(comments.length), bad, normal, good);
            delete item.restaurants;
            return {
                ...item,
                restaurant: {
                    uniqueId: restaurant.uniqueId,
                    name: restaurant.restaurantName,
                    address: restaurant.address,
                    image: restaurant.image? restaurant.image: "",
                    rating,

                }
            }
        }));
        console.log(items.length);
        items.sort((current, next) => {
            return current.order - next.order
        });
        const collectionList = await this.getListById(list.id);
        return {
            uniqueId: collectionList.uniqueId,
            title: collectionList.title,
            description: collectionList.description,
            updateDate: collectionList.updateDate,
            image: items.length > 0 ? items[0].restaurant.image : '',
            items,
        };
    };

    async checkRestaurantInclude(restaurant: Restaurant, list: List) {
        const restaurantModel = await this.listItemRepository.findOne({
            where: {
                restaurants: restaurant,
                list,
            }
        });
        if(restaurantModel) {
            return true;
        } 
        return false;
    }

    async getCollectionListCount(list: List) {
        return this.listItemRepository.findAndCount({
            where: {
                list,
            }
        });
    }

    async deleteCollectionListItem(uniqueId: string) {
        return this.listItemRepository.delete({
            uniqueId,
        })
    }

    async deleteCollectionListItemWithRestaurant(restaurant: Restaurant) {
        return this.listItemRepository.delete({
            restaurants: restaurant,
        });
    }

     async searchRestaurantWithToken(searchRestaurantDto: SearchListItemRestaurantDto, user: User) {
        const restaurants = await this.restaurantService.searchRestaurant(searchRestaurantDto);
        const collectionList = await this.listRepository.findOne({
            where: {
                uniqueId: searchRestaurantDto.listUniqueId,
            }
        });
        const listItems = await this.listItemRepository.find({
            where: {
                list: collectionList
            },
            relations: ['restaurants'],
        })
        const newRestaurants = restaurants.map( (restaurant) => {
            let isAdded = false;
            for(const item of listItems) {
                if(item.restaurants.id === restaurant.id) {
                    isAdded = true;
                    break;
                }
            }
            return {
                isAdded,
                ...restaurant,
            }
        })

        return newRestaurants;
    }

    
}
