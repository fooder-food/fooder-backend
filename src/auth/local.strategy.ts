import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, IStrategyOptions } from "passport-local";
import { AuthService } from "./auth.service";
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        } as IStrategyOptions);
    }

    async validate(email: string, password: string) {
        const user = await this.authService.validateUser(email, password);
        if(!user) {
            throw new HttpException({
                status:HttpStatus.CREATED,
                message: 'Email or password are invalid',
                error: 'Email or password are invalid',
            },HttpStatus.CREATED);
        }
        return user;
    }
}