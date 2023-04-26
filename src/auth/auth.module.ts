import {forwardRef, Module} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UserModule} from "../user/user.module";
import {JwtModule} from "@nestjs/jwt";
import * as process from "process";
import {configModule} from "../common/config.root";

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
  configModule,
  forwardRef(()=>UserModule),
  JwtModule.register({
    secret: process.env.SECRET_KEY,
    signOptions: {
      expiresIn: '24h'
    }
  })
  ],
  exports: [
       AuthService
  ]
})
export class AuthModule {}


