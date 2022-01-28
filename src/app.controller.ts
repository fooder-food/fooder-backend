import { Controller, Get, HostParam, Post,} from '@nestjs/common';
import { AppService } from './app.service';
import { ReportService } from './report/report.service';
import { RestaurantsService } from './restaurants/restaurants.service';
import { UsersService } from './users/users.service';
import  * as dayjs from 'dayjs';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly restaurantService: RestaurantsService,
    private readonly userService: UsersService,
    private readonly reportService: ReportService,
    ) {}

  @Get()
  getHello(@HostParam('origin') origin): string {
    return this.appService.getHello();
  }

  @Get('/data') 
    async getAdminDashboardData() {
      const reportData = await this.reportService.getAllReportWithCount();
      reportData[0] = reportData[0].filter(item => {
        const year =dayjs().year();
        const itemYear = dayjs(item.createDate).year();
        return year == itemYear;
      })
      const reportFinalData = {
        count: reportData[1],
        data:this.appService.calcReportYearForChart(reportData[0]),
      }

      const restaurantData = await this.restaurantService.getAllRestaurantWithCount();
      restaurantData[0] = restaurantData[0].filter(item => {
        const year =dayjs().year();
        const itemYear = dayjs(item.createDate).year();
        return year == itemYear;
      })
      const restaurantFinalData = {
        count: restaurantData[1],
        data:this.appService.calcRestaurantYearForChart(restaurantData[0]),
      }

      const userData = await this.userService.getUserWithCount();
      userData[0] = userData[0].filter(item => {
        const year =dayjs().year();
        const itemYear = dayjs(item.createDate).year();
        return year == itemYear;
      })
      const userFinalData = {
        count: userData[1],
        data:this.appService.calcUserYearForChart(userData[0]),
      }

      return {
        user: userFinalData,
        restaurant: restaurantFinalData,
        report: reportFinalData,
      }
    }


}
