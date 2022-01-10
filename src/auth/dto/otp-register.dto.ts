import { IsString } from "class-validator";

export class OtpRegisterDto {
    @IsString()
    phoneNumber: string;

    @IsString()
    password: string;
}