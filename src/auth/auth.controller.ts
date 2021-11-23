import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { UserRegisterDto } from './dto/user-register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService
    ) {}
    @Post('user/register')
    async register(@Body() userRegisterDto: UserRegisterDto) {
       

        try {
            return await this.usersService.create({
                ...userRegisterDto,
                firstName: '',
                lastName: '',
                username: '',
            });        
        } catch (error) {
            let errorMsg = 'error message';

            if(error.code === 'ER_DUP_ENTRY') {
                errorMsg = 'Duplicate Email';
            }
            throw new HttpException({
                HttpStatus:HttpStatus.FORBIDDEN,
                error: errorMsg,
            },HttpStatus.FORBIDDEN);
        }
    }
}
