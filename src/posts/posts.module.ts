import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Posts} from "./posts.model";
import {FilesModule} from "../files/files.module";

@Module({
  imports: [SequelizeModule.forFeature([Posts]), FilesModule],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
