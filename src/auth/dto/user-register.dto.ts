import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserRegisterDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'email address', example: 'xxx@xxx.com' , type: 'string', required: true})
    email: string;
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'password', example: '123456', type: 'string', required: true })
    password: string;
}