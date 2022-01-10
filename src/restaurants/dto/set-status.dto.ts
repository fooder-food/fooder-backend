export class SetRestaurantStatusDto {
    restaurantUniqueId: string;
    // 0 is reject 1 is pending  2 is approved
    status: number;
}