import { IsString } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    categoryName: string;
    @IsString()
    categoryIcon: string;
}