import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {ROLE_KEY} from "./roles-auth.decorator";
import {UserService} from "../user/user.service";
import {TokenService} from "../token/token.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private userService: UserService, private tokenService : TokenService, private reflector: Reflector) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRole = this.reflector.getAllAndOverride<string>(ROLE_KEY, [context.getHandler(), context.getClass()])

        if (!requiredRole) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        //Вытаскиваем Authorization из header запроса
        const authorizationHeader = request.headers.authorization

        const user =  this.tokenService.verifyToken(authorizationHeader, 'access')

        const accessIsAllowed = await this.userService.verifyUserRole(user.email, requiredRole)

        if (!accessIsAllowed) {
            throw new ForbiddenException({message: 'Доступ ограничен'})
        }
        return true;
    }
}