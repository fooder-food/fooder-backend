import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { compareSync } from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    private googleClient =  new OAuth2Client('603246120002-hfpisaj3sf78dq7mutljtrqajn827frn.apps.googleusercontent.com');
    constructor(private usersServices: UsersService) {

    }

    async validateUser(email: string, password: string) {
        const user = await this.usersServices.findOneByEmail(email, true);
        if(user && compareSync(password, user.password)) {
            delete user.password;
            return user;
        } 
        return null;
    }

    async validateGoogleId(tokenId: string) {
      const ticket = await this.googleClient.verifyIdToken({
            idToken: tokenId,
            audience: '603246120002-hfpisaj3sf78dq7mutljtrqajn827frn.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        const userid = payload['sub'];
    }
}
