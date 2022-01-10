import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Response } from "express";

export const CurrentUser = createParamDecorator((data, ctx: ExecutionContext) => {
   const request = ctx.switchToHttp().getRequest();
   const res = ctx.switchToHttp().getResponse<Response>();
   return {
      user: request.user,
      code: res.statusCode,
   };
});