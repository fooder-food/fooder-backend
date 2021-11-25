import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { CurrentUser } from './current-user.decorator';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
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
                mesg: error,
            },HttpStatus.FORBIDDEN);
        }
    }

    @Post('user/login')
    @UseGuards(AuthGuard('local'))
    async login(@Body() userLoginDto: UserLoginDto, @CurrentUser() user: User ) {
        return {
            user,
            token: this.jwtService.sign(String(user.email)),
        };
    }
}
