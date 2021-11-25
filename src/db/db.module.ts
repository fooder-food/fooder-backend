import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

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
                    synchronize: true,
                    migrationsRun: true,
                    logging: false,
                    entities:['dist/src/**/*.entity.js'],
                    migrations: ['dist/src/database/migration/*.js'],
                    cli: {
                        migrationsDir: 'src/database/migration',                      
                    }
                }
            }
        }),
        UsersModule,
    ],
})
export class DbModule {

}
