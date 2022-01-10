import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JoinColumn, Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/users.entity';
import { url } from 'inspector';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRespository: Repository<Category>,
    ) {}

    async createCategory(createCategory: CreateCategoryDto, user: User,) {
        const categoryModel =  this.categoryRespository.create({
            ...createCategory,
            uniqueId: uuidv4(),
            createdBy: user,
        });

        const category = await this.categoryRespository.save(categoryModel);

        delete category.id;
        return category;
    }

    async getAllCategory() {
        return this.categoryRespository.createQueryBuilder('category')
        .innerJoinAndSelect('category.createdBy', 'user')
        .select(['category.id', 'category.uniqueId', 'category.categoryName', 'category.categoryIcon', 'category.isActive','category.createDate', 'category.updateDate', 'user.username'])
        .where('category.isActive=:active', {active: 1})
        .getMany();
    }

    async getAllCategoryWithInActive() {
        return this.categoryRespository.createQueryBuilder('category')
        .innerJoinAndSelect('category.createdBy', 'user')
        .select(['category.id', 'category.uniqueId', 'category.categoryName', 'category.categoryIcon', 'category.isActive', 'user.username'])
        .getMany();
    }

    async getSingleCategory(id: string) {
        return this.categoryRespository.createQueryBuilder('category')
        .innerJoinAndSelect('category.createdBy', 'user')
        .select(['category.id', 'category.uniqueId', 'category.categoryName', 'category.categoryIcon', 'category.isActive', 'user.username'])
        .where('category.id=:id', {id: id})
        .getOne();
    }

    async getCategoryByUniqueId(uniqueId: string) {
        return this.categoryRespository.findOne({
            where: {
                uniqueId: uniqueId
            }
        })
    }

    async categoryUpdate(updateCategoryDto: UpdateCategoryDto) {
        try {
            const category = await this.categoryRespository.findOneOrFail({
                where: {
                    id: updateCategoryDto.id,
                }
            });
    
        
            if(category.id) {
                return await this.categoryRespository.save({
                   ...category,
                   ...updateCategoryDto,
                });
            }
           } catch (error) {
               return error;
           }
    }
}
