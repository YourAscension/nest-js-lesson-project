import {forwardRef, Module} from '@nestjs/common';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./user.model";
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {RolesModule} from "../roles/roles.module";
import {AuthModule} from "../auth/auth.module";

@Module({
    imports: [
        SequelizeModule.forFeature([User]),
        RolesModule,
        forwardRef(()=>AuthModule),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}
