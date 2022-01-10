import { UserType } from "../users.entity";

export class CreateUserDto {
    email: string;
    password: string;
    username: string;
    type: CreateUseType;
    userType: UserType;
}


export enum CreateUseType {
    EMAIL = 'email',
    PHONE = 'phone',
    GOOGLE = 'google',
    FACEBOOK = 'FACEBOOK',
}