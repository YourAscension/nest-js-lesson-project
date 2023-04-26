import {HttpException, HttpStatus, Injectable, UnauthorizedException} from '@nestjs/common';
import {CreateUserDto} from "../user/dto/create-user.dto";
import {UserService} from "../user/user.service";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs'
import {User} from "../user/user.model";

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) {
    }

    async login(userDto: CreateUserDto){
        const user = await this.validateUser(userDto);
        return this.generateToken(user)

    }

    async registration(userDto: CreateUserDto){
        const candidate = await this.userService.getUserByEmail(userDto.email);
        if (candidate){
            throw new HttpException('Пользователь с таким email уже существует', HttpStatus.BAD_REQUEST)
        }
        const hashPassword =await bcrypt.hash(userDto.password, 5);
        const user = await this.userService.createUser({...userDto, password: hashPassword})
        return this.generateToken(user)
    }

    private async generateToken(user: User) {
        const payload = {email: user.email, id: user.id, role: user.roles.role}
        console.log(payload)
        return {
            token: this.jwtService.sign(payload, {})
        }
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email)

        if (user){
            const passwordEquals = await bcrypt.compare(userDto.password, user.password)
            if (passwordEquals){
                return user
            }
        }
        throw new UnauthorizedException({message: 'Неправильный email или пароль'})
    }

    verifyToken(authHeader: string){
        try {
            //Вытаскиваем Authorization из header запроса
            const bearer = authHeader.split(' ')[0]
            const token = authHeader.split(' ')[1]
            //Если тип токена не Bearer или токена нет, то ошибка
            if (bearer !=='Bearer' || !token){
                throw new Error()
            }
            //Проверяем токен, если токен невалидный, то ошибка, если валидный - данные.
            return this.jwtService.verify(token);
        }
        catch (e) {
            throw new UnauthorizedException({message: 'Пользователь не авторизован'})
        }
    }
}

