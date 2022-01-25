import { Body, Controller, HttpException, HttpStatus, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SmsService } from 'src/sms/sms.service';
import { CreateUseType } from 'src/users/dto/create-user.dto';
import { User, UserType } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { OtpRegisterDto } from './dto/otp-register.dto';
import { OtpValidateDto } from './dto/otp-validate.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly smsService: SmsService,
    ) {}

    @Post('user/email/validate/:email')
    async validateEmail(@Param('email') email) {
        const isAvailable = await this.usersService.findEmailIsAvaiable(email);
        return {
            isAvailable,
            message: `email ${isAvailable ? 'is isAvailable':'not available'}`,
        }
    }

    @Post('user/register/email')
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
    async register(@Body() userRegisterDto: UserRegisterDto,) {
       

        try {
            const user =  await this.usersService.create({
                ...userRegisterDto,
                type: CreateUseType.EMAIL,
                userType: UserType.USER,
            }); 

            
            return {
                user,
                message: 'register successful',
            }
        } catch (error) {
            console.log(error);
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

    @Post('admin/register/email')
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
    async adminRegister(@Body() userRegisterDto: UserRegisterDto) {
       

        try {
            const user =  await this.usersService.create({
                ...userRegisterDto,
                type: CreateUseType.EMAIL,
                userType: UserType.ADMIN,
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

    // @Post('user/register/otp')
    // async otpRegister(@Body() otpRegister: OtpRegisterDto) {
    //     try {
    //         const user =  await this.usersService.create({
    //             ...otpRegister,
    //             email: '',
    //             firstName: '',
    //             lastName: '',
    //             username: '',
    //             type: CreateUseType.PHONE,
    //             userType: UserType.USER,
    //         }); 
    //         await this.requestOtp(otpRegister.phoneNumber);
    //         return {
    //             uniqueId: user.uniqueId,
    //             message: 'code get successful'
    //         }

    //     } catch(error) {
    //         console.log(error);
    //     }
    // }

    // @Post('user/request-otp') 
    // async requestOtp(phoneNumber){
    //     await this.smsService.initialPhoneVerification(phoneNumber);
    // }

    // @Post('user/register/otp-validate')
    // async otpValidate(@Body() otpValidateDto: OtpValidateDto) {
    //     try {
    //      const {error, message, user } = await this.smsService.confirmPhoneNumber(otpValidateDto);
    //      if(error) {
    //          return {
    //              message,
    //              user,
    //          }
    //      }
    //      return {
    //          message,
    //          user,
    //      }
            
    //     } catch (error) {
    //         console.log(error);
    //         if(error.code === 20404) {
    //             throw new HttpException({
    //                 HttpStatus: HttpStatus.UNAUTHORIZED,
    //                 error: 'request code again',
    //                 message: 'request code again',
    //             }, HttpStatus.UNAUTHORIZED);    
    //         }
    //     }
       
    // }


    @Post('login/email')
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
    async login(@CurrentUser() data: any, @Body() UserLoginDto: UserLoginDto) {
        const user: User = data.user;
        console.log(UserLoginDto.deviceToken);
        if(!user.isActive == false) {
            return {        
                message: 'your account is banned please contact customer service.',
            }
        }
        if(UserLoginDto.deviceToken && user.userType === UserType.USER) {
            this.usersService.updateUserDeviceToken(UserLoginDto.deviceToken, data.user.uniqueId);
        }
        return {
            user: data.user,
            code: data.code,
            token: this.jwtService.sign(String(data.user.email)),
            message: 'login success',
        };
    }

    @Post('login/google-signin')
    async googleSignIn() {
        
    }

    @Post('')
    async phonevalidate(@Body() req) {
       return await this.smsService.initialPhoneVerification(req.phoneNumber);
      
    }
}
