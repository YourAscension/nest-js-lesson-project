import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {ROLE_KEY} from "./roles-auth.decorator";
import {UserService} from "../user/user.service";
import {AuthService} from "./auth.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private authService: AuthService, private userService: UserService, private reflector: Reflector) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRole = this.reflector.getAllAndOverride(ROLE_KEY, [context.getHandler(), context.getClass()])

        if (!requiredRole) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        //Вытаскиваем Authorization из header запроса
        const authHeader = request.headers.authorization;

        const user = this.authService.verifyToken(authHeader)

        const accessIsAllowed = await this.userService.verifyUserRole(user.email, requiredRole)

        if (!accessIsAllowed) {
            throw new ForbiddenException({message: 'Доступ ограничен'})
        }
        return true;
    }
}