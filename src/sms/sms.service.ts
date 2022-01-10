import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Twilio } from 'twilio';
import { ConfirmPhoneNumberDto } from './dto/confirm-phone-number.dto';

@Injectable()
export class SmsService {
    private twilloClient: Twilio;
    constructor(
        private usersService: UsersService,
    ) {
        const twillowAccountSid = process.env.TWILIO_ACCOUNT_SID;
        const twilloAccountAuthToken = process.env.TWILIO_AUTH_TOKEN;
        this.twilloClient = new Twilio(twillowAccountSid, twilloAccountAuthToken);
    }

    async initialPhoneVerification(phoneNumber: string) {
        const serviceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID;
        return this.twilloClient.verify.services(serviceSid)
        .verifications.create({
            to: phoneNumber,
            channel: 'sms',
        }); 
    }

    async confirmPhoneNumber(confirmPhoneNumberDto: ConfirmPhoneNumberDto) {
        const serviceSid = process.env.TWILIO_VERIFICATION_SERVICE_SID;
        const result = await this.twilloClient.verify.services(serviceSid)
        .verificationChecks.create({
            to: confirmPhoneNumberDto.phoneNumber,
            code: confirmPhoneNumberDto.verificationCode,
        });
        if(!result.valid || result.status !== 'approved') {
            return {
                error: true,
                message: 'invalid OTP',
            }
        }
        const user = await this.usersService.markPhoneNumberAsConfirmed(confirmPhoneNumberDto.uniqueId);
        return {
            message: 'resgister successful',
            user,
        }

    }


}
