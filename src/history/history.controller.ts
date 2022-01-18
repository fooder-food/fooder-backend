import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { SearchHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
    constructor(
        private readonly historyService: HistoryService,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('/all')
    async getSearchHistory(@CurrentUser() data) {
        
        return await this.historyService.getAll(data.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('create')
    async createHistory(@CurrentUser() data, @Body() searchHistoryDto: SearchHistoryDto) {
        const history = await this.historyService.findByRestaurantUniqueId(searchHistoryDto.restaurantUniqueId);
        if(history) {
            const updateDto: UpdateHistoryDto = {
                isActive: 1,
                restaurantUniqueId: searchHistoryDto.restaurantUniqueId,
            }
            await this.historyService.updateHistoryByRestaurantUniqueId(updateDto);
            return {
                msg: 'history has already',
            }
        }
        return this.historyService.create(searchHistoryDto, data.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('update')
    async updateHistory(@CurrentUser() data, @Body() updateHistoryDto: UpdateHistoryDto) {
       await this.historyService.updateHistoryByRestaurantUniqueId(updateHistoryDto);
       return await this.historyService.getAll(data.user);
    }
}
