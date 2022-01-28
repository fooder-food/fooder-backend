import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { FirebaseService } from 'src/firebase/firebase.service';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { createReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
    constructor(
        private readonly reportService: ReportService,
        private readonly firebaseService: FirebaseService,
        private readonly restaurantService: RestaurantsService,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('/create')
    async createReport(@Body() createReportDto: createReportDto, @CurrentUser() data) {
        return this.reportService.create(createReportDto, data.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/all')
    async getAllReport() {
        return this.reportService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/:id')
    async getSingleReport(@Param('id') id) {
        return this.reportService.getSingle(id);

    }

    @UseGuards(AuthGuard('jwt'))
    @Put('/update/:id')
    async updateReport(@Param('id') id, @Body() updateReportDto: UpdateReportDto) {
       try {
        await this.reportService.updateReport(id, updateReportDto);
        const report = await this.reportService.getSingle(id);
        const restuarant  = await this.restaurantService.getSingleRestaurantInfo(report.target);

        this.firebaseService.create(
            `report is approved by admin`,
            restuarant.image,
            'report',
            restuarant.uniqueId,
            report.reporter,
    );
        await this.firebaseService.pushMessaging({
            title: `your report is accepted`,
            bodyData: {
                param: 'report',
                uniqueId: report.uniqueId,
                url:report.uniqueId,
            },
            description: 'your report is accepted',
            userId: report.reporter.uniqueId,
        });

        return {
            message: 'Update Successful',
        } 
       } catch(e) {
        return {
            message: 'Update Failed',
        }
       }

    }
}
