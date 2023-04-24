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
            token: this.jwtService.sign(payload)
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
}
