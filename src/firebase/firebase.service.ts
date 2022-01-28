import { HttpService } from '@nestjs/axios';
import { Injectable, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { UserNotification } from './notification.entity';
import * as dayjs from 'dayjs';


export interface  messageInterface {
    title: string,
    bodyData: any,
    description: string,
    userId: string;
}


@Injectable()
export class FirebaseService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(UserNotification)
        private readonly userNotification: Repository<UserNotification>,
    ) {}

    async pushMessaging(info: messageInterface) {
        const header = {
            "Content-Type": "application/json",
            "Authorization": `Basic ${process.env.ONE_SIGNAL_KEY}`,
        };

        const url = 'https://onesignal.com/api/v1/notifications';

        const body = {
            app_id: `${process.env.ONE_SIGNAL_APP_ID}`,
            headings: {
                "en": info.title,
            },
            contents: {
                "en": info.description,
            },
            data: {
                data: info.bodyData,
            },
            url: info.bodyData.url,
            include_external_user_ids:[info.userId],
            //include_external_user_ids:["e6543ab6-965f-47cc-b7ae-66eee004fc62"]
        }

        return await lastValueFrom(
                await this.httpService.post(url, JSON.stringify(body), { headers: header, }).pipe(
                    map(res => res.data)
                )
            );
        // const notificationInfo = {
        //     title:"TOLE",
        //     body: 'TEST',
        //     text: 'test',
        // }
        // const headerConfig =  {
        //     "Authorization": "key=AAAA6pgjiJ0:APA91bEQDKCDPt8BmQsKsavD3YHFKtPwYDPa3ojR99TuHjtxqjf5A2BroKZ4BHb0BHnkXkfLNHQ20VU9OFwv26jlQGaPPOz5le0xuJHV4HLeSDIyjIPLOM0OyaTkWarlY_Ogw3h0IrHG",
        //     "Content-Type": "application/json",

        // }
        // const url = 'https://fcm.googleapis.com/fcm/send';
        // const body = {
        //     notification: notificationInfo,
        //     registration_ids: [
        //         info.registerID,
        //         //'eX6W6Go_TlWZNOoJVXm6AT:APA91bHg9sSUICKro419jMgRyDqnNBCvrrO5IxYigZPE-qn4IqqN3X9LIKCLREY1pwzn4ikuVzKbjt75_Utub5q1mbir2M2FpZpcEqXzFio-spQnUjIMqwnFaBF06Sj7fbh-8D_mwcH0'
        //     ]
        // }
        // //this.httpService.post(url, JSON.stringify(body), { headers: headerConfig, }).subscribe((response) => console.log(response.data));
        // return await lastValueFrom(
        //     await this.httpService.post(url, JSON.stringify(body), { headers: headerConfig, }).pipe(
        //         map(res => res.data)
        //     )
        // );
    
    }

    async create(content: string, icon: string, type: string, params: string, user: User) {
        const notification = await this.userNotification.create({
            uniqueId: uuidv4(),
            content,
            icon,
            type,
            user,
            params,
        });
        this.userNotification.save(notification);
    }

    async getNotificationByUser(user: User) {
        return this.userNotification.find({
            where: {
                user,
            },
            order: {
                createDate: 'DESC',
            }
        });
    }

    async getNotificationCount(user: User) {
        return this.userNotification.count({
            user,
            isRead: false,
        });
    }

    async updateNotificationIsRead(uniqueId: string) {
        const notification = await this.userNotification.findOne({
            uniqueId,
        });
        console.log(notification);
        notification.isRead = true;
        return this.userNotification.update(notification.id, notification);
    }


    calcDiffTime(calcTime: string) {
        const dayNow = dayjs();
        let minutes = dayNow.diff(calcTime, 'minutes');
        if(minutes < 60) {
            if(minutes <= 1) {
                return `${minutes} minute ago`;
            }
            return `${minutes} minutes ago`;
        } 
        let hours = dayNow.diff(calcTime, 'hours');
        if(hours < 24) {
            if(hours <= 1) {
                return `${hours} hour ago`;
            }
            return `${hours} hours ago`;
        }

        if(hours < 48) {
            const time = dayjs(calcTime).format('hh:ss A')
            return `Yesterday at ${time}`;
        }
        
        const day = dayjs(calcTime).format('DD/MM/YYYY');
        const time = dayjs(calcTime).format('hh:ss A');
        return `${day} at ${time}`;

    }
}
