import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags   } from '@nestjs/swagger';

@Controller('uploads') 
@ApiTags('Uploads')
export class UploadsController {
    @Post('image')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({summary: 'Upload a image'})
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
        type: 'object',
        properties: {
            file: {

                type: 'string',
                format: 'binary',
            },
        },
        },
    })
   @ApiResponse({
       status: 201,
       description: 'Image has been upload successful'
   }) 
   @ApiResponse({
       status: 403,
       description: 'Forbidden'
   })
   @ApiResponse({
       status: 404,
       description: 'Server internal Error',
   })
   @ApiConsumes('multipart/form-data')
    async uploadImage(@UploadedFile('file') file): Promise<any> {
        return file;
    }
}