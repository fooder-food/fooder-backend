import { IsBoolean, IsNumber, IsString } from "class-validator";

export class UpdateCategoryDto {
    @IsString()
    categoryName: string;
    @IsString()
    categoryIcon: string;
    @IsBoolean()
    isActive: boolean;

    @IsNumber()
    id: number
}