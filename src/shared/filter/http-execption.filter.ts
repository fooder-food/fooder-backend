import { Catch, HttpException, ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { Response, Request } from 'express';


@Catch(HttpException)
export class HttpExecptionFilter implements ExceptionFilter<HttpException> {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request =ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionRes: any = exception.getResponse();
        const { message, error } = exceptionRes;
        response
            .status(status)
            .json({
                code: status,
                data: {
                    code: status,
                    message,
                    error,
                }                
            })
    }
}