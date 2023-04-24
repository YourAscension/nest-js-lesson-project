import { Module } from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./user.model";
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {RolesModule} from "../roles/roles.module";

@Module({
    imports: [SequelizeModule.forFeature([User]), RolesModule],
    controllers: [UserController],
    providers: [UserService]
})
export class UserModule {}
