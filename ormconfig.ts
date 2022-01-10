import { MysqlConnectionOptions } from "typeorm/driver/mysql/MysqlConnectionOptions";

const options:MysqlConnectionOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    //false for production
    synchronize: true, //process.env.NODE_ENV === 'production' ? false: true,
    logging: false,
    entities:['dist/**/*.entity.js'],
    migrations: ['src/database/migration/**/*.ts'],
    subscribers: ['src/subscriber/**/*.ts'],
    cli: {
        entitiesDir: 'src/**/entities',
        migrationsDir: 'src/database/migration',
        subscribersDir: 'src/subscriber',
    }
}

export = options;