import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { AddRestaurantDto } from './dto/add-restaurnt.dto';
import { Restaurant, RestaurantStatus } from './restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Comment, CommentRating } from 'src/comments/comment.entity';
import { CommentsService } from 'src/comments/comments.service';
import { FavoriteService } from 'src/favorite/favorite.service';
import { UsersService } from 'src/users/users.service';
import * as haversine from 'haversine-distance'
import { GetRestaurantDto } from './dto/get-restaraurants.dto';
import { SetRestaurantStatusDto } from './dto/set-status.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SearchRestaurantDto } from './dto/search-restaurant.dto';
import { User } from 'src/users/users.entity';

@Injectable()
export class RestaurantsService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Restaurant)
        private readonly restaurantRepository: Repository<Restaurant>,
        private readonly commentService: CommentsService,
        private readonly favoriteService: FavoriteService,
        private readonly userService: UsersService,
        private readonly firebaseService: FirebaseService,
    ) {}

    async getAllRestaurant() {
        return this.restaurantRepository.find();
    }

    async getRestaurantInfo(id) {
        return this.restaurantRepository.findOne({
            where: {
                uniqueId: id,

            },
            relations: ['createBy', 'selectedCategory']
        });
    }
    
    async updateRestaurantInfo(restaurant:Restaurant) {
        return this.restaurantRepository.update(restaurant.id, restaurant);
    }

    async setRestaurantStatus(setRestaurantStatus: SetRestaurantStatusDto, registerId: string) {
        console.log(setRestaurantStatus);
        const status = setRestaurantStatus.status;
        let restaurantStatus = RestaurantStatus.PENDING;
       const restaurantModel = await  this.restaurantRepository.findOne({
            where: {
                uniqueId: setRestaurantStatus.restaurantUniqueId,
            }
        });
        if(status == 0) {
            restaurantStatus = RestaurantStatus.REJECT;
        } else if (status == 1) {
            restaurantStatus = RestaurantStatus.PENDING;
        } else {
            restaurantStatus = RestaurantStatus.APPROVE;
        }

        restaurantModel.status = restaurantStatus;

        const restaurant =  await this.restaurantRepository.save(restaurantModel);
        console.log(registerId);
        return await this.firebaseService.pushMessaging({
            title: 'title',
            bodyData: 'body',
            text: 'text',
            registerID: registerId,
        });
        return restaurant;
    }

    async getInformationByPlaceId(placeId: string) {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.GOOGLE_API_KEY}`;
        return await firstValueFrom(
            await this.httpService.post(url,).pipe(
                map(res => res.data.result)
            )
        );
    }

    async getPlaceId(address: string) {
        console.log(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_API_KEY}`;
        return await firstValueFrom(
            await this.httpService.get(url).pipe(
                map(res => res.data.results)
            )
        );
    }


    async getRestaurantWithUniqueId(id: string) {
        return this.restaurantRepository.findOne({
            where: {
                uniqueId:id,
            }
        })
    }


    async getRestaurantInfoWihOutToken(getRestaurantDto: GetRestaurantDto, filterQuery: string) {
        let sql = '';
        console.log(filterQuery);
        if(getRestaurantDto.state) {
            sql = `SELECT restaurant.restaurantName, restaurant.id, restaurant.uniqueId,restaurant.state, 
            restaurant.geo, restaurant.view,restaurant.image,COUNT(distinct comment.id) AS comments, 
            COUNT(DISTINCT favorite.userId) as follower FROM restaurant LEFT JOIN comment ON 
            restaurant.id = comment.restaurant_id LEFT JOIN favorite ON restaurant.id = favorite.restaurantId 
            ${filterQuery == "WHERE " ? "WHERE": filterQuery + "AND "} restaurant.state='${getRestaurantDto.state}' AND restaurant.status = 'approve' GROUP BY restaurant.id;`;
        } else {
            sql = `SELECT restaurant.restaurantName, restaurant.id, restaurant.uniqueId,restaurant.state, 
            restaurant.geo, restaurant.view,restaurant.image,COUNT(distinct comment.id) AS comments, 
            COUNT(DISTINCT favorite.userId) as follower FROM restaurant LEFT JOIN comment ON 
            restaurant.id = comment.restaurant_id LEFT JOIN favorite ON restaurant.id = favorite.restaurantId 
            ${filterQuery} restaurant.status='approve' GROUP BY restaurant.id;`;
        }

        console.log(sql);
       
        let restaurants = (await this.restaurantRepository.query(sql));
        let comments = await this.commentService.getAll();
        const userGeo = {
            latitude: getRestaurantDto.latitude,
            longitude: getRestaurantDto.longitude, 
        }
        restaurants = restaurants.map(restaurant => {
            const belongComments = comments.filter((item) => item.restaurant.id === restaurant.id);
            let [good,normal, bad] = [0,0,0];
            belongComments.forEach((item) => {
                if(item.type === CommentRating.GOOD) {
                    good++;
                } else if (item.type === CommentRating.NORMAL) {
                    normal++;
                }else {
                    bad++;
                }
            })
            const rating = this.calculateRating(Number(restaurant.comments), bad, normal, good);
            restaurant.rating = rating;
            restaurant.geo = JSON.parse(restaurant.geo);
            const restaurantGeo = {
                latitude: restaurant.geo.lat,
                longitude: restaurant.geo.lng, 
            }
            restaurant.distance = Math.ceil(haversine(userGeo, restaurantGeo));
            return restaurant;
        });
        if(!getRestaurantDto.state) {
           restaurants = restaurants.filter(restaurants =>  restaurants.distance <= getRestaurantDto.radius);
        }

        restaurants = restaurants.sort((current, next) => {
            //rating
            if(getRestaurantDto.sort == 0) {
              return  next.rating - current.rating;
            } 
            //review
            if(getRestaurantDto.sort == 1) {
                return next.comments - current.comments;
            }
            // distance
            return current.distance - next.distance;
            
        });
        return restaurants;
    }

    calculateRating(totalNumber: number, bad: number, normal: number, good: number) {
        if(totalNumber === 0) {
            return 5;
        }
        const final = ((bad * 1) + (normal * 2.5) + (good * 5)) / totalNumber;
        return final ? Number(final.toFixed(2)) : 0 ;
    }

    async createRestaurant(addRestaurantDto: AddRestaurantDto) {
        const restaurantModel: Restaurant = this.restaurantRepository.create({
            uniqueId: uuidv4(),
            ...addRestaurantDto,
        });

        const restaurant = await this.restaurantRepository.save(restaurantModel);
        return restaurant;
    }

    async getCommentByType(restaurant: Restaurant, type: number) {
        let totalPhotos = [];
        let comments: any = await this.commentService.getByRestaurantIdWithType(restaurant.id, type);
        comments =  await Promise.all(comments.map(async (comment) => {
            const photos = await this.commentService.getImageById(comment.id);
            const totalLikeUser =  await (await this.commentService.getAllCommentLikeById(comment)).map(item => item.user);
            totalPhotos.push(...photos);
            return {
                ...comment,
                photos,
                totalLikeUser,
            }
        }));
        return comments;

    }

    async getSingleRestaurantInfo(uniqueId: string) {
        const sql = `
        SELECT restaurant.restaurantName, restaurant.id, restaurant.uniqueId,restaurant.state, restaurant.view, restaurant.geo, 
        restaurant.address, restaurant.pricePerson, restaurant.website,restaurant.image, restaurant.businessHour, restaurant.breakTime, 
        restaurant.restaurantPhone, restaurant.updateDate,restaurant.createDate, restaurant.createById,
        COUNT(distinct comment.id) AS totalComments, COUNT(DISTINCT favorite.userId) as totalFollowers FROM restaurant 
        LEFT JOIN comment ON restaurant.id = comment.restaurant_id 
        LEFT JOIN favorite ON restaurant.id = favorite.restaurantId 
        WHERE restaurant.uniqueId=? GROUP BY restaurant.id;` ;
        let totalPhotos = [];
        let restaurant = (await this.restaurantRepository.query(sql,[uniqueId]))[0];
        totalPhotos.push({
            imageUrl: restaurant.image,
            updateDate: restaurant.updateDate,
            createDate: restaurant.createDate,
            uniqueId: uniqueId,
        });
        const followers = await this.favoriteService.getByRestaurantId(restaurant.id);
        let comments: any = await this.commentService.getByrestaurantId(restaurant.id);
        const user = await this.userService.finduserById(restaurant.createById);
        comments =  await Promise.all(comments.map(async (comment) => {
             const photos = await this.commentService.getImageById(comment.id);
             const totalLikeUser =  await (await this.commentService.getAllCommentLikeById(comment)).map(item => item.user);
             totalPhotos.push(...photos);
             return {
                 ...comment,
                 photos,
                 totalLikeUser,
             }
         }));
         let [good,normal, bad] = [0,0,0];
         (comments as Comment[]).forEach(comment => {
            if(comment.type === CommentRating.GOOD) {
                good++;
            } else if (comment.type === CommentRating.NORMAL) {
                normal++;
            }else {
                bad++;
            }
         })
         const rating = this.calculateRating(Number(restaurant.totalComments), bad, normal, good);

        restaurant.good = good;
        restaurant.normal = normal;
        restaurant.bad = bad;
        restaurant.rating = rating;
        restaurant.comments = comments;
        restaurant.geo = JSON.parse(restaurant.geo);
        restaurant.followers = followers;
        restaurant.createUser = user;
        if(restaurant.businessHour)
        restaurant.businessHour = JSON.parse(restaurant.businessHour);

        totalPhotos =  totalPhotos.sort((current, next)=> next.id - current.id); 
        if(totalPhotos.length > 5) {
            totalPhotos = totalPhotos.slice(0,5);
        }
        restaurant.photos = totalPhotos;

        delete restaurant.createById;
        //let totalPhotos = await this.commentService.getAllCommentImage();
        return restaurant;
    }

    async searchRestaurant(searchRestaurantDto: SearchRestaurantDto) {
        let restaurants = await this.restaurantRepository.find({
            where: {
                restaurantName: Like(`%${searchRestaurantDto.keyword}%`),
                status: RestaurantStatus.APPROVE,
            }
            
            
        });

        const newRestaurants = await Promise.all(restaurants.map(async (restaurant) => {
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
            const rating = this.calculateRating(Number(comments.length), bad, normal, good);
            return {
               ...restaurant,
               rating,
            }
        }));

        return newRestaurants;
    }
    
}
