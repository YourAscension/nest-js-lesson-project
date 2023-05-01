import {Module} from '@nestjs/common';
import {TokenService} from './token.service';
import {JwtModule} from "@nestjs/jwt";
import {SequelizeModule} from "@nestjs/sequelize";
import {Token} from "./token.model";
import {configModule} from "../common/config.root";

@Module({
    imports: [
        configModule,
        SequelizeModule.forFeature([Token]),
        JwtModule
    ],
    providers: [TokenService],
    exports: [TokenService]
})
export class TokenModule {
}
