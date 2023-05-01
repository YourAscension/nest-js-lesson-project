import {Module} from '@nestjs/common';
import {TokenService} from './token.service';
import {TokenController} from './token.controller';
import {JwtModule} from "@nestjs/jwt";
import {SequelizeModule} from "@nestjs/sequelize";
import {Token} from "./token.model";

@Module({
    imports: [
        SequelizeModule.forFeature([Token]),
        JwtModule
    ],
    controllers: [TokenController],
    providers: [TokenService],
    exports: [TokenService]
})
export class TokenModule {
}
