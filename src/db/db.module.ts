import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory() {
                return {
                    type: 'mysql',
                    host: process.env.DB_HOST,
                    port: parseInt(process.env.DB_PORT),
                    username: process.env.DB_USERNAME,
                    database: process.env.DB_NAME,
                    password: process.env.DB_PASSWORD,
                    autoLoadEntities: true,
                    //false for production
                    synchronize: process.env.NODE_ENV === 'production' ? false: true,
                }
            }
        })
    ],
})
export class DbModule {

}
