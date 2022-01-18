import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CategoryService } from 'src/category/category.service';
import { CommentsService } from 'src/comments/comments.service';
import { AddFavoriteDto } from 'src/favorite/dto/add_favorite.dto';
import { CreateFavoriteDto } from 'src/favorite/dto/create_favorite.dto';
import { FavoriteService } from 'src/favorite/favorite.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { json } from 'stream/consumers';
import { AddCommentDto } from './dto/add-comment.dto';
import { AddRestaurantDto } from './dto/add-restaurnt.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { GetRestaurantDto } from './dto/get-restaraurants.dto';
import { GetRestaurantFilterDto } from './dto/get-restaurants-filter.dto';
import { SearchRestaurantDto } from './dto/search-restaurant.dto';
import { SetRestaurantStatusDto } from './dto/set-status.dto';
import { Restaurant } from './restaurant.entity';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly restaurantsService: RestaurantsService,
        private readonly categoryService: CategoryService,
        private readonly favoriteService: FavoriteService,
        private readonly userService: UsersService,
        private readonly commentService: CommentsService,
    ) {}
    
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('image'))
    @Post('/create')
    async createRestaurant(@UploadedFile('file') file,@CurrentUser() data, @Body() createRestaurantDto: CreateRestaurantDto) {
        const image = file.url;
        const information = await this.restaurantsService.getInformationByPlaceId(createRestaurantDto.placeId);
        const category = await this.categoryService.getCategoryByUniqueId(createRestaurantDto.selectedCategoryUniqueId);
        const user = data.user;
        const addressComponent = information.address_components as [];
        const address = information.formatted_address;
        const country = (addressComponent[addressComponent.length - 2] as any).long_name;
        const countryAlias = (addressComponent[addressComponent.length - 2] as any).short_name;
        const state = (addressComponent[addressComponent.length - 3] as any).long_name;
        const stateAlias = (addressComponent[addressComponent.length - 3] as any).short_name;
        const phone = information.formatted_phone_number
        const geo = JSON.stringify(information.geometry.location);

        const businessHour = information.opening_hours ? JSON.stringify(information.opening_hours.weekday_text) : JSON.stringify([]);
        const website = information.website === undefined ? '' : information.website;
        createRestaurantDto.restaurantPhone = createRestaurantDto.restaurantPhone === '' ? phone : createRestaurantDto.restaurantPhone;
        
        delete createRestaurantDto.selectedCategoryUniqueId;

        const addRestaurantDto: AddRestaurantDto = {
            ...createRestaurantDto,
            country,
            countryAlias,
            state,
            stateAlias,
            geo,
            businessHour,
            website,
            pricePerson: '',
            breakTime: '',
            user: user.id,
            address: address,
            selectedCategory: category,
            createBy: data.user,
            image,
        };

       await this.restaurantsService.createRestaurant(addRestaurantDto);

        return {
            message: 'ok',
            addRestaurantDto,
        }
    }

    @Get('/all')
    async getRestaurantWihOutToken(@Query() getRestaurantsDto: GetRestaurantDto) {
        let filterQuery = '';
        if(getRestaurantsDto.filter) {
            const filters = getRestaurantsDto.filter.split(',');
            console.log(filters);
            for(let index = 0;index < filters.length; index++) {
                const category = await this.categoryService.getCategoryByUniqueId(filters[index]);
                if(index === 0) {
                    filterQuery +=`WHERE category_id=${category.id} `;
                } else {
                    filterQuery +=`OR category_id=${category.id} `;
                }
            }
        }
        console.log(filterQuery);
        return await this.restaurantsService.getRestaurantInfoWihOutToken(getRestaurantsDto, filterQuery);
    }

    @Get('/:id')
    async getSingleRestaurant(@Param('id') id) {
        return await this.restaurantsService.getSingleRestaurantInfo(id);
    }
    @UseGuards(AuthGuard('jwt'))
    @Post('/favorite')
    async addFollow(@Body() addFavoriteDto: AddFavoriteDto) {
        const user = await this.userService.finduserByUniqueId(addFavoriteDto.userUniqueId);
        const restaurant = await this.restaurantsService.getRestaurantWithUniqueId(addFavoriteDto.restaurantUniqueId);

        const createFavoriteDto: CreateFavoriteDto = {
            user: user.id,
            restaurant: restaurant.id,
        };
        return await this.favoriteService.create(createFavoriteDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/favorite/:id')
    async deleteFollow(@Param('id') id) {
        return await this.favoriteService.delete(id);
    }

    @UseInterceptors(FileFieldsInterceptor([
        {
            name: 'photos',
            maxCount:30,
        }
    ]))
    @UseGuards(AuthGuard('jwt'))
    @Post('comments/create')
    async createComment(@UploadedFiles() files, @Body() createCommentDto: CreateCommentDto, @CurrentUser() data) {
        const user :User = data.user;
        console.log(createCommentDto.type);
        let photos = [];
        if(files.photos) {
            photos = [...files.photos];
        }
        const restaurant: Restaurant = await this.restaurantsService.getRestaurantWithUniqueId(createCommentDto.restaurantUniqueId);
        const addCommentDto: AddCommentDto = {
            restaurant,
            user,
            content: createCommentDto.content,
            type: createCommentDto.type,
            photos: photos,
        }
        return this.commentService.create(addCommentDto);
      
    }

    @Post('/search')
    async searchRestaurant(@Body() searchRestaurantDto: SearchRestaurantDto) {
        return this.restaurantsService.searchRestaurant(searchRestaurantDto);
    }
    // @UseGuards(AuthGuard('jwt'))
    // @Post('/search')
    // async searchRestaurantWithToken(@Body() searchRestaurantDto: SearchRestaurantDto, @CurrentUser() data) {
    //     return this.restaurantsService.searchRestaurantWithToken(searchRestaurantDto, data.user);
    // }


    @UseGuards(AuthGuard('jwt'))
    @Put('/set_status')
    async setStatus(@Body() setRestaurantStatusDto: SetRestaurantStatusDto, @CurrentUser() data) {
        const user: User = data.user;
        return await this.restaurantsService.setRestaurantStatus(setRestaurantStatusDto,user.deviceToken);
    }

    @Post('/notification')
    async notification() {
        console.log('test');
       // const result = await this.firebaseService.pushMessaging();
        // return {
        //     msg: 'halo',
        //     result,
        // }
        
    }
 }
