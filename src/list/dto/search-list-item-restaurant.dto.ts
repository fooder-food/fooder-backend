import { SearchRestaurantDto } from "src/restaurants/dto/search-restaurant.dto";

export class SearchListItemRestaurantDto extends SearchRestaurantDto {
    listUniqueId: string;
}