import { HttpService } from '@nestjs/axios';
import { Injectable, } from '@nestjs/common';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';


export interface  messageInterface {
    title: string,
    bodyData: string,
    text: string,
    registerID: string;
}


@Injectable()
export class FirebaseService {
    constructor(
        private readonly httpService: HttpService,
    ) {}

    async pushMessaging(info: messageInterface) {
        const notificationInfo = {
            title:"TOLE",
            body: 'TEST',
            text: 'test',
        }
        const headerConfig =  {
            "Authorization": "key=AAAA6pgjiJ0:APA91bEQDKCDPt8BmQsKsavD3YHFKtPwYDPa3ojR99TuHjtxqjf5A2BroKZ4BHb0BHnkXkfLNHQ20VU9OFwv26jlQGaPPOz5le0xuJHV4HLeSDIyjIPLOM0OyaTkWarlY_Ogw3h0IrHG",
            "Content-Type": "application/json",

        }
        const url = 'https://fcm.googleapis.com/fcm/send';
        const body = {
            notification: notificationInfo,
            registration_ids: [
                info.registerID,
                //'eX6W6Go_TlWZNOoJVXm6AT:APA91bHg9sSUICKro419jMgRyDqnNBCvrrO5IxYigZPE-qn4IqqN3X9LIKCLREY1pwzn4ikuVzKbjt75_Utub5q1mbir2M2FpZpcEqXzFio-spQnUjIMqwnFaBF06Sj7fbh-8D_mwcH0'
            ]
        }
        //this.httpService.post(url, JSON.stringify(body), { headers: headerConfig, }).subscribe((response) => console.log(response.data));
        return await lastValueFrom(
            await this.httpService.post(url, JSON.stringify(body), { headers: headerConfig, }).pipe(
                map(res => res.data)
            )
        );
    
    }
}
