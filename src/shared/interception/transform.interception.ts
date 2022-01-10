import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response as ResExpress } from "express";
import { map, Observable } from "rxjs";

export interface Response<T> {
    data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const ctx = context.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse<ResExpress>();
        return next
                .handle()
                .pipe(
                    map(
                        (data) =>({
                            code: res.statusCode,
                            data,
                            message: data.message === null ? '' : data.message,
                        })
                    )
                );   
    }
}