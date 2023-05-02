import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from './roles-auth.decorator';
import { TokenService } from '../token/token.service';
import { RolesService } from './roles.service';
import { ForbiddenMessages } from '../common/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private rolesService: RolesService,
    private tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<string>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    //Вытаскиваем Authorization из header запроса
    const authorizationHeader = request.headers.authorization;

    const { payload } = this.tokenService.verifyToken(
      authorizationHeader,
      'access',
    );

    const accessIsAllowed = await this.rolesService.checkUserRole(
      requiredRole,
      payload.id,
    );

    if (!accessIsAllowed) {
      throw new ForbiddenException(ForbiddenMessages.ACCESS_DENIED);
    }
    return true;
  }
}
