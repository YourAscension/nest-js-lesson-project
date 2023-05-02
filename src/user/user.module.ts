import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RolesModule } from '../roles/roles.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), RolesModule, TokenModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
