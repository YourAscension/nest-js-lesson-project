import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {
    }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        try {
            //Вытаскиваем Authorization из header запроса
            const autHeader = request.headers.authorization;
            const bearer = autHeader.split(' ')[0]
            const token = autHeader.split(' ')[1]
            //Если тип токена не Bearer или токена нет, то ошибка
            if (bearer !=='Bearer' || !token){
                throw new UnauthorizedException({message: 'Пользователь не авторизован'})
            }
            console.log(token)

            //Проверяем токен
            const user = this.jwtService.verify(token);
            request.user = user;
            return true;
        }
        catch (e) {
            throw new UnauthorizedException({message: 'Пользователь не авторизован'})
        }
    }
}