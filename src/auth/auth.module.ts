import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SmsModule } from 'src/sms/sms.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    UsersModule, 
    PassportModule, 
    SmsModule,
    JwtModule.registerAsync({
    useFactory() {
      return {
        secret: process.env.SECRET,
      }
    }
  }),],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
