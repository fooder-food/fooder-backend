import { Category } from "src/category/category.entity";
import { User } from "src/users/users.entity";
import { CreateRestaurantDto } from "./create-restaurant.dto";

export class AddRestaurantDto extends CreateRestaurantDto {
    geo: string;
    address: string;
    pricePerson: string;
    website: string;
    businessHour: string;
    breakTime: string;
    country: string;
    countryAlias: string;
    state: string;
    stateAlias: string;
    user: number;
    selectedCategory: Category;
    createBy: User;
    image: string;
}

