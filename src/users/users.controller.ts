import { Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UpdateUserWithAvatarDto } from './dto/update-user-with-avatar.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@CurrentUser() data) {
        const user = data.user;
        delete user.id;
        return user;
    }

    @Put('update')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('avatar'))
    async updateUser(@UploadedFile('file') file, @Body() updateUserDto: UpdateUserDto, @CurrentUser() data) {
        let imageUrl = '';
        let imageType = '';
        if(file) {
            imageUrl = file.url;
            imageType = (file.mimetype as string).split('/').pop();
        }
        
        const newUpdateUserDto: UpdateUserWithAvatarDto = {
            ...updateUserDto,
            avatar: imageUrl,
            avatarType: imageType,
        }
        return this.usersService.updateUser(newUpdateUserDto, data.user.uniqueId);
    }
}
