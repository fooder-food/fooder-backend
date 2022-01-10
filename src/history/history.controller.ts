import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { SearchHistoryDto } from './dto/create-history.dto';
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
            return {
                msg: 'history has already',
            }
        }
        return this.historyService.create(searchHistoryDto, data.user);
    }
}
