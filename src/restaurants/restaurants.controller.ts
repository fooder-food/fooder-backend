import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CategoryService } from 'src/category/category.service';
import { CommentRating } from 'src/comments/comment.entity';
import { CommentsService } from 'src/comments/comments.service';
import { SetCommentLikeDto } from 'src/comments/dto/setCommentLike.dto';
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
import { GetCommentByTypeDto } from './dto/get-comment-by-type.dto';
import { GetRestaurantDto } from './dto/get-restaraurants.dto';
import { GetRestaurantFilterDto } from './dto/get-restaurants-filter.dto';
import { SearchRestaurantDto } from './dto/search-restaurant.dto';
import { SetRestaurantStatusDto } from './dto/set-status.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateRestaurantInfoDto } from './dto/update-restaurant.dto';
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
        if(!getRestaurantsDto.filter) {
            filterQuery += 'WHERE ';
        }
        return await this.restaurantsService.getRestaurantInfoWihOutToken(getRestaurantsDto, filterQuery);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/all-admin')
    async getRestaurantWithToken() {
        return this.restaurantsService.getAllRestaurant();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/info-admin/:id')
    async getRestaurantInfoWithToken(@Param('id') id) {
        console.log(id);
        return this.restaurantsService.getRestaurantInfo(id);
    }

    @Get('/:id')
    async getSingleRestaurant(@Param('id') id) {
        return await this.restaurantsService.getSingleRestaurantInfo(id);
    }

    @Get('/photos/:id')
    async getRetaurantsImages(@Param('id') id) {
        return this.restaurantsService.getRestaurantAllImages(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/favorite/all')
    async getAllFollow(@CurrentUser() data) {
       const favoriteList =  await this.favoriteService.getFavoriteByUser(data.user);
       const newFavoriteList = Promise.all(
        favoriteList.map(async favorite => {
            const restaurant = {...(favorite.restaurant as unknown as Restaurant)};
            // calculate total review
            const comments = await this.commentService.getByrestaurantId(restaurant.id);
            // calculate total rating
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
            const rating = this.restaurantsService.calculateRating(Number(comments.length), bad, normal, good);
            const newRestaurnt = {
                uniqueId: restaurant.uniqueId,
                state: restaurant.state,
                name: restaurant.restaurantName,
                image: restaurant.image,
                rating: rating,
                view: restaurant.view,
                review: comments.length,
            }
            return {
                uniqueId: favorite.uniqueId,
                isActive: favorite.isActive,
                restaurant: newRestaurnt,
            }
        })
       );
       return newFavoriteList;
    }


    @UseGuards(AuthGuard('jwt'))
    @Post('/favorite')
    async addFollow(@Body() addFavoriteDto: AddFavoriteDto) {
        const user = await this.userService.finduserByUniqueId(addFavoriteDto.userUniqueId);
        const restaurant = await this.restaurantsService.getRestaurantWithUniqueId(addFavoriteDto.restaurantUniqueId);

        const createFavoriteDto: CreateFavoriteDto = {
            restaurant: restaurant.id,
        };
        return await this.favoriteService.create(createFavoriteDto, user);
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

    @UseInterceptors(FileFieldsInterceptor([
        {
            name: 'photos',
            maxCount:30,
        }
    ]))
    @UseGuards(AuthGuard('jwt'))
    @Put('comments/update')
    async updateComment(@UploadedFiles() files, @Body() updateCommentDto: UpdateCommentDto, @CurrentUser() data) {
        let photos = [];
        if(updateCommentDto.delImages) {
            const delImageList = JSON.parse(updateCommentDto.delImages) as any[];
            for(let index = 0; index < delImageList.length; index ++) {
                await this.commentService.delCommentImage(delImageList[index].id);
            }
        }

        if(files.photos) {
            photos = [...files.photos];
        }
        
        return this.commentService.update(updateCommentDto, photos);
      
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('comments/:id')
    async deleteComment(@Param('id') id) {
       const comment = await this.commentService.getCommentByUniqueId(id);
       const restaurantId = await comment.restaurant.uniqueId;
       const image = await this.commentService.getCommentImage(comment);

       if(image.length > 1) {
           await this.commentService.delCommentImageByCommentId(comment);
       } 
       const like = await this.commentService.delCommentlikeByComment(comment);
       await this.commentService.delComment(comment.id);
       return await this.restaurantsService.getSingleRestaurantInfo(restaurantId);
    }

    @Post('/search')
    async searchRestaurant(@Body() searchRestaurantDto: SearchRestaurantDto) {
        return this.restaurantsService.searchRestaurant(searchRestaurantDto);
    }
    

    @UseGuards(AuthGuard('jwt'))
    @Put('/set_status')
    async setStatus(@Body() setRestaurantStatusDto: SetRestaurantStatusDto, @CurrentUser() data) {
        const user: User = data.user;
        return await this.restaurantsService.setRestaurantStatus(setRestaurantStatusDto,user.deviceToken);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/update')
    async updateRestaurantInfo(@Body() updateRestaurantInfoDto: UpdateRestaurantInfoDto, @CurrentUser() data) {
        try {
        const results = await this.restaurantsService.getPlaceId(updateRestaurantInfoDto.address);
        const placeId = results[0].place_id;
        const restaurant = await this.restaurantsService.getRestaurantInfo(updateRestaurantInfoDto.uniqueId);
        const oldStatus = restaurant.status;
        const user = restaurant.createBy;
        if(restaurant.placeId !== placeId) {
            const addressComponent = results[0].address_components as [];
            restaurant.placeId = placeId;
            restaurant.geo = JSON.stringify(results[0].geometry.location);
             restaurant.country = (addressComponent[addressComponent.length - 2] as any).long_name;
             restaurant.countryAlias = (addressComponent[addressComponent.length - 2] as any).short_name;
             restaurant.state = (addressComponent[addressComponent.length - 3] as any).long_name;
             restaurant.stateAlias = (addressComponent[addressComponent.length - 3] as any).short_name;
        }
        restaurant.id = updateRestaurantInfoDto.id;
        restaurant.uniqueId = updateRestaurantInfoDto.uniqueId;
        restaurant.image = updateRestaurantInfoDto.image;
        restaurant.address = updateRestaurantInfoDto.address;
        restaurant.restaurantName = updateRestaurantInfoDto.restaurantName;
        restaurant.pricePerson = updateRestaurantInfoDto.pricePerson;
        restaurant.website = updateRestaurantInfoDto.website;
        restaurant.businessHour = updateRestaurantInfoDto.businessHour;
        restaurant.breakTime = updateRestaurantInfoDto.breakTime;
        restaurant.restaurantPhone = updateRestaurantInfoDto.restaurantPhone;
        restaurant.status = updateRestaurantInfoDto.status;
        await this.restaurantsService.updateRestaurantInfo(restaurant);
        if(updateRestaurantInfoDto.status.toUpperCase() === 'APPROVE' 
        && oldStatus.toUpperCase() !== 'APPROVE') {
            this.firebaseService.create(
                    `${restaurant.restaurantName} is approved by admin`,
                    restaurant.image,
                    'restaurant',
                    restaurant.uniqueId,
                    user,
            );
            this.firebaseService.pushMessaging({
                title: `${restaurant.restaurantName} is approved`,
                bodyData: {
                    param: 'restaurant',
                    uniqueId: restaurant.uniqueId,
                    url:restaurant.uniqueId,
                },
                description: 'Your add restaurant is approved',
                userId: user.uniqueId,
            });
        }
        
         return {
             message: 'Update Successful',
         }
        } catch(e) {
            return {
                message: 'Update Failed',
            }
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/comment/set-like')
    async setLike(@CurrentUser() data, @Body() setCommentLikeDto: SetCommentLikeDto) {
        const comment = await this.commentService.getCommentByUniqueId(setCommentLikeDto.commentUniqueId);
        console.log(comment);
        const isExist = await this.commentService.checkCommentLikeIsExist(data.user, comment);
        if(isExist.length === 0) {
             await this.commentService.addCommentLike(comment, data.user);
        } else {
             await this.commentService.delCommentLike(data.user, comment);
        }
        return this.restaurantsService.getSingleRestaurantInfo(comment.restaurant.uniqueId);
    }

    @Get('/comments/type')
    async getCommentsByType(@Body() getCommentByTypeDto: GetCommentByTypeDto, ) {
        const restaurant = await this.restaurantsService.getRestaurantInfo(getCommentByTypeDto.restaurantUniqueId);
        return this.restaurantsService.getCommentByType(restaurant, getCommentByTypeDto.type);
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
