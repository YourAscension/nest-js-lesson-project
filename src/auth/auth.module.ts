import { Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {UserModule} from "../user/user.module";
import {configModule} from "../common/config.root";
import {TokenModule} from "../token/token.module";

@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [
        configModule,
        UserModule,
        TokenModule
    ],
    exports: [
        AuthService
    ]
})
export class AuthModule {
}


