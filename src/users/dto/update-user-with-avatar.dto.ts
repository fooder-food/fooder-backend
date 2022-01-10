import { UpdateUserDto } from "./update-user.dto";

export class UpdateUserWithAvatarDto extends UpdateUserDto {
    avatar: string;
    avatarType: string;
}


