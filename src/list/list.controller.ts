import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import e from 'cors';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { CreateListItemWithSearchDto } from './dto/create-list-item-with-search.dto';
import { CreateListItemDto } from './dto/create-list-item.dto';
import { CreateListDto } from './dto/create-list.dto';
import { DelListItemWithSearchDto } from './dto/del-list-item-with-search.dto';
import { DeleteListItemDto } from './dto/delete-list-item.dto';
import { DeleteListDto } from './dto/delete-list.dto';
import { ReorderItemDto } from './dto/reorder-item.dto';
import { SearchListItemRestaurantDto } from './dto/search-list-item-restaurant.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ListService } from './list.service';

@Controller('list')
export class ListController {
    constructor(
        private readonly listService: ListService,
        private readonly RestaurantService: RestaurantsService,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('/all')
    async getAllList(@CurrentUser() data) {
        const collectionList = await this.listService.getAllListByUser(data.user);
        const newCollectionList = Promise.all(collectionList.map(async (list) => {
            const items = await this.listService.getListItemByCollectionList(list);
            let image = "";
            return {
                ...list,
                image: items.image,
            }
        }));
       return newCollectionList;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/create')
    async createList(@Body() createListDto: CreateListDto, @CurrentUser() data) {
        await this.listService.createList(createListDto, data.user);
        const collectionList = await this.listService.getAllListByUser(data.user);
        const newCollectionList = Promise.all(collectionList.map(async (list) => {
            let image = "";
            return {
                ...list,
                image,
            }
        }));
       return newCollectionList;
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/update')
    async updateList(@Body() updateListDto: UpdateListDto, @CurrentUser() data) {
        await this.listService.updateListByUniqueId(updateListDto);
        const collectionList = await this.listService.getCollectionListByUniqueId(updateListDto.uniqueId);
        return await this.listService.getListItemByCollectionList(collectionList);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/delete')
    async deleteList(@Body() deleteListDto: DeleteListDto, @CurrentUser() data) {
        const collection = await this.listService.getCollectionListByUniqueId(deleteListDto.listUniqueId);
        await this.listService.delListItemByListUniqueId(collection);
        await this.listService.delListByUniqueId(collection.uniqueId);
        const collectionList =  await this.listService.getAllListByUser(data.user);
        const newCollectionList = Promise.all(collectionList.map(async (list) => {
            const items = await this.listService.getListItemByCollectionList(list);
            let image = "";
            return {
                ...list,
                image: items.image,
            }
        }));
       return newCollectionList;
    }
    @UseGuards(AuthGuard('jwt'))
    @Post('/item/create')
    async createListItem(@Body() createListItemDto: CreateListItemDto, @CurrentUser() data) {
        let msg = '';
       const restaurant = await this.RestaurantService.getRestaurantWithUniqueId(createListItemDto.restaurantUniqueId);
       const collectionList = await this.listService.getCollectionListByUniqueId(createListItemDto.collectionUniqueId);
       const isInclude = await this.listService.checkRestaurantInclude(restaurant, collectionList);
       if(!isInclude) {
        const order = (await this.listService.getCollectionListCount(collectionList))[1] + 1;
        await this.listService.createListItem(restaurant, collectionList, order); 
        msg = 'add restaurant successful.';
       } else {
           msg = 'this restaurant is already included on your list.';
       }

       return {
        msg,
        items: await this.listService.getListItemByCollectionList(collectionList),
       } 
     
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/item/:id')
    async getListItem(@Param('id') id: string) {
       try {
        const collectionList = await this.listService.getCollectionListByUniqueId(id);
        return await this.listService.getListItemByCollectionList(collectionList);
       } catch (error) {
           
       }
    }
    @UseGuards(AuthGuard('jwt'))
    @Delete('/item')
    async delListItem(@Body() deleteListItemDto: DeleteListItemDto) {
       try {
         await this.listService.deleteCollectionListItem(deleteListItemDto.itemUniqueId);
         const collectionList = await this.listService.getCollectionListByUniqueId(deleteListItemDto.listUniqueId);
        return await this.listService.getListItemByCollectionList(collectionList);
       } catch (error) {
           
       }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/search')
    async searchRestaurantWithToken(@Body() searchRestaurantDto: SearchListItemRestaurantDto, @CurrentUser() data) {
        return this.listService.searchRestaurantWithToken(searchRestaurantDto, data.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/add-item')
    async addItem(@Body() createListItemDto: CreateListItemWithSearchDto, @CurrentUser() data) {
        const restaurant = await this.RestaurantService.getRestaurantWithUniqueId(createListItemDto.restaurantUniqueId);
        const collectionList = await this.listService.getCollectionListByUniqueId(createListItemDto.collectionUniqueId);
        const order = (await this.listService.getCollectionListCount(collectionList))[1] + 1;
        await this.listService.createListItem(restaurant, collectionList, order); 
        const searchDto: SearchListItemRestaurantDto = {
            keyword: createListItemDto.keyword,
            listUniqueId: createListItemDto.collectionUniqueId,
        }

        const restaurants = await this.listService.searchRestaurantWithToken(searchDto, data.user);
        return restaurants;
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/remove-item')
    async delItem(@Body() deleteListItemDto: DelListItemWithSearchDto, @CurrentUser() data) {
       try {
         const restaurant = await this.RestaurantService.getRestaurantWithUniqueId(deleteListItemDto.restaurantUniqueId);
         await this.listService.deleteCollectionListItemWithRestaurant(restaurant);
         const searchDto: SearchListItemRestaurantDto = {
            keyword: deleteListItemDto.keyword,
            listUniqueId: deleteListItemDto.collectionUniqueId,
        }
        const restaurants = await this.listService.searchRestaurantWithToken(searchDto, data.user);
        return restaurants;
       } catch (error) {
           
       }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/reorder-item')
    async reOrderItem(@Body() reorderItemDto: ReorderItemDto, @CurrentUser() data) {
       try {
           const newOrderList = reorderItemDto.newOrderList;
           newOrderList.forEach(item => {
               console.log(item);
               this.listService.updateOrder(item.uniqueId, item.order);
           });
           const collectionList = await this.listService.getCollectionListByUniqueId(reorderItemDto.listUniqueId);
           return await this.listService.getListItemByCollectionList(collectionList);
       } catch (error) {
           
       }
    }

}
