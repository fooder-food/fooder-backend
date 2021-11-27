import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { hashSync } from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}
   async create(createUserDto: CreateUserDto): Promise<User> {
        const userModel = this.userRepository.create({
            ...createUserDto, 
            uniqueId: uuidv4(),
            password: hashSync(createUserDto.password),
        });
        const user = await this.userRepository.save(userModel);
        delete user.password;
        delete user.id;
        delete user.isActive;
        return user;
    }

    async findOneByEmail(email: string, withPass: boolean = false) {
        const selectColumn: (keyof User)[] = ['email', 'firstName', 'lastName', 'username', 'uniqueId'];
        if(withPass) selectColumn.push('password');
        
        return this.userRepository.findOne({
            where: {
                email,
            },
            select: selectColumn,
        });
    }

}
