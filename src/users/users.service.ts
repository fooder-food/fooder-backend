import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from './users.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto, CreateUseType } from './dto/create-user.dto';
import { hashSync } from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserWithAvatarDto } from './dto/update-user-with-avatar.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}
   async create(createUserDto: CreateUserDto): Promise<User> {
        const userModel = this.userRepository.create({
            ...createUserDto, 
            phoneNumber: '',
            uniqueId: uuidv4(),
            avatar: '',
            password: hashSync(createUserDto.password),
        });
        const user = await this.userRepository.save(userModel);
        delete user.password;
        delete user.id;
        delete user.isActive;
        return user;
    }

    async findOneByEmail(email: string, withPass: boolean = false) {
        const selectColumn: (keyof User)[] = ['email','username', 'uniqueId', 'userType', 'id', 'createDate', 'updateDate', 'avatar', 'avatarType', 'deviceToken'];
        if(withPass) selectColumn.push('password');
        
        return this.userRepository.findOne({
            where: {
                email,
            },
            select: selectColumn,
        });
    }

    async updateUser(updateUserDto: UpdateUserWithAvatarDto, uniqueId: string) {
       
       try {
        const user = await this.userRepository.findOneOrFail({
            where: {
                uniqueId,
            }
        });

        if(updateUserDto.avatar === '') {
            delete updateUserDto.avatar;
        }

        if(updateUserDto.avatarType === '') {
            delete updateUserDto.avatarType;
        }

        if(user.id) {
            return await this.userRepository.save({
                ...user,
                ...updateUserDto,
            });
        }
       } catch (error) {
           return error;
       }
    }

    async updateUserDeviceToken(deviceToken: string, uniqueId: string) {
        try {
            const user = await this.userRepository.findOneOrFail({
                where: {
                    uniqueId,
                }
            });
    
            if(user.id) {
                if(deviceToken) {
                    return await this.userRepository.save({
                        ...user,
                        deviceToken,
                    });
                }
                return await this.userRepository.save({
                    ...user,
                });
            }
           } catch (error) {
               return error;
           }
    }

    async markPhoneNumberAsConfirmed(uniqueId) {
        const selectColumn: (keyof User)[] = ['email', 'username', 'uniqueId', 'phoneNumber'];
        await this.userRepository.update({uniqueId: uniqueId}, {
            isPhoneConfirmed: true,
            isActive: true,
        });
        const user = this.userRepository.findOne({
            where: {
                uniqueId,
            },
            select: selectColumn,
        });
        return user;
    }

    async findEmailIsAvaiable(email: string) {
        const user = await this.userRepository.findOne({
            where: {
                email: email,
            }
        });
        return user === undefined ? false : true;
    }

    async finduserByUniqueId(id: string) {
        return this.userRepository.findOne({
            where: {
                uniqueId:id,
            }
        });
    }
    async finduserById(id: string) {
        return this.userRepository.findOne({
            where: {
                id,
            }
        });
    }

    async getAllUser() {
        return this.userRepository.find({
            where: {
                userType: UserType.USER
            }
        });
    }

    async getSingleUser(id: string) {
        const user = await this.userRepository.findOne({
            uniqueId: id,
        });
        return user;
    }

    async upateUserIsActive(id: string, isActive: number) {
      try {
        const user = await this.userRepository.findOne({
            uniqueId: id,
        });

        user.isActive = isActive === 0 ? false: true;
        await this.userRepository.update(user.id, user);
        return 'update successful';
      } catch(e) {
          return 'update failed';
      }
    }

    async editPassword(pass, id) {
        const user = await this.userRepository.findOne({
            uniqueId: id,
        });
        console.log(typeof pass);
        user.password = hashSync(pass);
        return this.userRepository.update(user.id, user);
    }

}
