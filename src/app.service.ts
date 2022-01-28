import { Injectable } from '@nestjs/common';
import { Report } from './report/report.entity';
import * as dayjs from 'dayjs';
import { Restaurant } from './restaurants/restaurant.entity';
import { User } from './users/users.entity';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  calcReportYearForChart(reports: Report[]) {
    const data =[0,0,0,0,0,0,0,0,0,0,0,0];
    reports.forEach(report => {
      const month = dayjs(report.createDate).month();
      console.log(month);
      data[month] = data[month] + 1;
    })
    return data;
  }

  calcRestaurantYearForChart(reports: Restaurant[]) {
    const data =[0,0,0,0,0,0,0,0,0,0,0,0];
    reports.forEach(report => {
      const month = dayjs(report.createDate).month();
      console.log(month);
      data[month] = data[month] + 1;
    })
    return data;
  }

  calcUserYearForChart(reports: User[]) {
    const data =[0,0,0,0,0,0,0,0,0,0,0,0];
    reports.forEach(report => {
      const month = dayjs(report.createDate).month();
      console.log(month);
      data[month] = data[month] + 1;
    })
    return data;
  }
}
