import {Module} from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "../user/user.model";
import {UserModule} from "../user/user.module";
import {Roles} from "../roles/roles.model";
import {RolesModule} from "../roles/roles.module";
import {configModule} from "../common/config.root";
import {Posts} from "../posts/posts.model";

@Module({
    imports: [
        configModule,
        SequelizeModule.forRoot({
            dialect: 'oracle',
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            autoLoadModels: true,
            synchronize: true,
            models: [User, Roles, Posts]
        }),
        UserModule,
        RolesModule
    ],
})
export class DatabaseModule {
}

