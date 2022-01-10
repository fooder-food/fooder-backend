import { IsString } from "class-validator";

export class CreateCategoryWithFileDto  {
    File: any;
    
    @IsString()
    categoryName: string;
}