import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { compareSync } from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(private usersServices: UsersService) {}

    async validateUser(email: string, password: string) {
        const user = await this.usersServices.findOneByEmail(email, true);
        if(user && compareSync(password, user.password)) {
            delete user.password;
            return user;
        } 
        return null;
    }
}
