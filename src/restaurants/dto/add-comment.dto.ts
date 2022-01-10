import { Restaurant } from "src/restaurants/restaurant.entity";
import { User } from "src/users/users.entity";

export class AddCommentDto {
    content: string;
    restaurant: Restaurant;
    user: User;
    type: number;
    photos: any[];
}