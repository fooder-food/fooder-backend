export class GetRestaurantDto {
    radius: number;
    longitude: number;
    latitude: number;
    // 0 is rating
    // 1 is review
    // 2 is distance
    sort: number;
    filter: string;
    state: string;
}