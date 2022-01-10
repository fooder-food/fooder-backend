import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards,} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User, UserType } from 'src/users/users.entity';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('category')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
    ) {}


    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    async create(@CurrentUser() data: any, @Body() createCategoryDto: CreateCategoryDto) {
        const user = data.user;
        if(user.userType !==  UserType.ADMIN) {
            throw new HttpException({
                HttpStatus: HttpStatus.UNAUTHORIZED,
                error: 'Invalid User',
                message: 'Invalid User',
            }, HttpStatus.UNAUTHORIZED);
        }
       const category: Category = await this.categoryService.createCategory(createCategoryDto, data.user);
       return {
        category,
        message: 'create Cuisine successful',
       };
    }

    @Get('all')
    async getAll() {
        const categories = await this.categoryService.getAllCategory();
        return {
            categories,
            message: 'get all category successful',
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('all_in_active')
    async getAllWithInActive() {
        const categories = await this.categoryService.getAllCategoryWithInActive();
        return {
            categories,
            message: 'get all category successful',
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('single/:id')
    async singleCategory(@Param('id') id) {
        const categories = await this.categoryService.getSingleCategory(id);
        return {
            categories,
            message: 'get category successful',
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('update')
    async updateCategory(@Body() updateCategoryDto: UpdateCategoryDto) {
        const categories = await this.categoryService.categoryUpdate(updateCategoryDto);
        return {
            categories,
            message: 'get category successful',
        }
    }

}
