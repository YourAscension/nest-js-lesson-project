import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule, UserModule, RolesModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
