import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { FilesModule } from './files/files.module';
import * as path from 'path'
import {ServeStaticModule} from "@nestjs/serve-static";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname,'static'),
    }),
      DatabaseModule,
      UserModule,
      RolesModule,
      AuthModule,
      PostsModule,
      FilesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
