import { Body, Controller, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserWithAvatarDto } from './dto/update-user-with-avatar.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserType } from './users.entity';
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

    @UseGuards(AuthGuard('jwt'))
    @Get('all')
    async getAllUser(@CurrentUser() data) {
        const user:User = data.user;
        
        if(user.userType === UserType.ADMIN) {
            return this.usersService.getAllUser();
        } else {
            return {
                msg: 'please using admin account',
            }
        }

    }
    @UseGuards(AuthGuard('jwt'))
    @Get('single/:id')
    async getSingleUserInfo(@CurrentUser() data, @Param('id') id) {
        const user:User = data.user;
        
        if(user.userType === UserType.ADMIN) {
            return this.usersService.getSingleUser(id);
        } else {
            return {
                msg: 'please using admin account',
            }
        }

    }

    @UseGuards(AuthGuard('jwt'))
    @Put('single')
    async updateSingleUserInfoStatus(@CurrentUser() data, @Body() updateUserStatusDto: UpdateUserStatusDto) {
        const user:User = data.user;
        
        if(user.userType === UserType.ADMIN) {
            const msg = await this.usersService.upateUserIsActive(updateUserStatusDto.id, updateUserStatusDto.isActive);
            return {
                msg,
            }
        } else {
            return {
                msg: 'please using admin account',
            }
        }

    }

    @Post('edit')
    async editpassword(@Body() body) {
        console.log(body);
        return await this.usersService.editPassword(body.password, body.id);
    }

}
