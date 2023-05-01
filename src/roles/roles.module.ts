import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {Roles} from "./roles.model";
import {TokenModule} from "../token/token.module";

@Module({
  imports: [SequelizeModule.forFeature([Roles])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService]
})
export class RolesModule {}


