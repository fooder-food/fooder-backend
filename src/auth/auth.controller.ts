import { Body, Controller, HttpException, HttpStatus, Post, UseFilters, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpExecptionFilter } from 'src/shared/filter/http-execption.filter';
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
    @ApiOperation({summary: 'Register user'})
    @ApiResponse({
        status: 201,
        description: 'User register successful',
        schema: {
            type: 'object',
            properties: {
                code: {type: 'number', description: 'api response code', example: 201 },
                data: {
                    type: 'object', 
                    description: 'user details', 
                    example: {
                        user: {
                            uniqueId: "b7ef5c26-1352-4bc6-8e36-8212c0e2e99d",
                            username: "",
                            email: "example@example.com",
                            firstName: "",
                            lastName: "",
                            createDate: "2021-11-27T01:49:26.283Z",
                            updateDate: "2021-11-27T01:49:26.283Z"
                        },
                        message: 'register successful'
                    }
                },
                message: {type: 'string', description: 'response message', example: 'register successful'}

            }
        }
    }) 
    @ApiResponse({
        status: 403,
        description: 'User register email duplicate',
        schema: {
            type: 'object',
            properties: {
                code: {type: 'number', description: 'api response code', example: 403 }, 
                message: {type: 'string', description: 'response message', example: 'Duplicate Email' },
                error: {type: 'string', description: 'error message', example: 'Duplicate Email' },
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Server internal Error',
        schema: {
            type: 'object',
            properties: {
                code: {type: 'number', description: 'api response code', example: 404 }, 
                message: {type: 'string', description: 'response message', example: 'Server Internal Error' },
                error: {type: 'string', description: 'error message', example: 'Server Internal Error' },
            }
        }
    })
    async register(@Body() userRegisterDto: UserRegisterDto) {
       

        try {
            const user =  await this.usersService.create({
                ...userRegisterDto,
                firstName: '',
                lastName: '',
                username: '',
            }); 
            
            return {
                user,
                message: 'register successful',
            }
        } catch (error) {
            let errorMsg = 'unknown error';

            if(error.code === 'ER_DUP_ENTRY') {
                errorMsg = 'Duplicate Email';
            }
            throw new HttpException({
                HttpStatus:HttpStatus.FORBIDDEN,
                error: errorMsg,
                message: errorMsg,
            },HttpStatus.FORBIDDEN);
        }
    }

    @Post('user/login')
    @UseGuards(AuthGuard('local'))
    @ApiOperation({summary: 'login to get token'})
    @ApiResponse({
        status: 201,
        description: 'login successful',
        schema: {
            type: 'object',
            properties: {
                code: {type: 'number', description: 'api response code', example: 201 },
                data: {
                    type: 'object', 
                    description: 'user details', 
                    example: {
                        user: {
                            uniqueId: "b7ef5c26-1352-4bc6-8e36-8212c0e2e99d",
                            username: "",
                            email: "example@example.com",
                            firstName: "",
                            lastName: "",
                            createDate: "2021-11-27T01:49:26.283Z",
                            updateDate: "2021-11-27T01:49:26.283Z"
                        },
                        token: 'jwt token',
                        message: 'login successful'
                    }
                },
                message: {type: 'string', description: 'response message', example: 'login successful'}

            }
        }
    }) 
    @ApiResponse({
        status: 401,
        description: 'Email or password are invalid',
        schema: {
            type: 'object',
            properties: {
                code: {type: 'number', description: 'api response code', example: 403 }, 
                message: {type: 'string', description: 'response message', example: 'Email or password are invalid' },
                error: {type: 'string', description: 'error message', example: 'Email or password are invalid' },
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Server internal Error',
        schema: {
            type: 'object',
            properties: {
                code: {type: 'number', description: 'api response code', example: 404 }, 
                message: {type: 'string', description: 'response message', example: 'Server Internal Error' },
                error: {type: 'string', description: 'error message', example: 'Server Internal Error' },
            }
        }
    })
    async login(@Body() userLoginDto: UserLoginDto, @CurrentUser() user: User ) {
        return {
            user,
            token: this.jwtService.sign(String(user.email)),
            message: 'login success',
        };
    }
}
