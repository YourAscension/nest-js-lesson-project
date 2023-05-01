import {BadRequestException,  Injectable, UnauthorizedException} from '@nestjs/common';
import {CreateUserDto} from "../user/dto/create-user.dto";
import {UserService} from "../user/user.service";
import * as bcrypt from 'bcryptjs'
import {TokenService} from "../token/token.service";

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private tokenService: TokenService) {
    }

    async login(userDto: CreateUserDto) {
        const user = await this.validateUser(userDto);
        const tokens = await this.tokenService.generateTokens(user)
        await this.tokenService.create({userId: user.id, token: tokens.refreshToken})
        return {user, ...tokens}
    }

    async registration(userDto: CreateUserDto){
        let user = await this.userService.getUserByEmail(userDto.email);
        if (user) {
            throw new BadRequestException('Пользователь с таким email уже существует')
        }
        const hashPassword = await bcrypt.hash(userDto.password, 5);
        user = await this.userService.createUser({...userDto, password: hashPassword})
        return user
    }

    private async validateUser(userDto: CreateUserDto) {
        const user = await this.userService.getUserByEmail(userDto.email)

        if (!user) {
            throw new UnauthorizedException('Неправильный email или пароль')
        }
        const passwordEquals = await bcrypt.compare(userDto.password, user.password)
        if (!passwordEquals) {
            throw new UnauthorizedException('Неправильный email или пароль')
        }
        return user
    }

}

