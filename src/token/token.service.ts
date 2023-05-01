import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Token} from "./token.model";
import {CreateTokenDto} from "./dto/create-token.dto";
import {JwtService} from "@nestjs/jwt";
import {User} from "../user/user.model";
import {UserService} from "../user/user.service";
import {CreateUserDto} from "../user/dto/create-user.dto";

@Injectable()
export class TokenService {
    constructor(@InjectModel(Token) private tokenRepository: typeof Token, private jwtService: JwtService) {
    }

    async create(dto: CreateTokenDto) {
        const token = await this.tokenRepository.create(dto)
        return token;
    }

    async findToken(token: string) {
        return await this.tokenRepository.findOne({where: {token: token}})
    }

    async generateTokens(user: User) {
        const payload = {id: user.id, email: user.email}

        const tokens = {
            accessToken: await this.jwtService.signAsync(payload, {secret: 'text111', expiresIn: '1m'}),
            refreshToken: await this.jwtService.signAsync(payload, {secret: 'text', expiresIn: '7d'})
        }
        return tokens
    }

    // async refreshToken(inputToken: string) {
    //     const tokenType = inputToken.split(' ')[0];
    //     const token = inputToken.split(' ')[1];
    //     if (tokenType !== 'Bearer' || !token) {
    //         throw new UnauthorizedException('Невалидный токен')
    //     }
    //
    //     const payloadData = this.verifyToken(token, 'refresh');
    //     const tokenFromDb = await this.findToken(token)
    //
    //     if (!payloadData || !tokenFromDb) {
    //         throw new UnauthorizedException('Невалидный токен')
    //     }
    //
    //     const user = await this.userService.getUserById(payloadData.id);
    //     const newTokens = await this.generateTokens(user);
    //     await this.create({userId: user.id, token: newTokens.refreshToken})
    //     return {...newTokens, user: CreateUserDto}
    // }

    verifyToken(inputToken: string, tokenVariant: 'access' | 'refresh') {
        try {
            const tokenType = inputToken.split(' ')[0];
            const token = inputToken.split(' ')[1];
            if (tokenType !== 'Bearer' || !token) {
                throw new Error()
            }
            //Проверяем токен, если токен невалидный, то ошибка, если валидный - данные.
            const secret = tokenVariant === 'access' && 'text111' || tokenVariant === 'refresh' && 'text'
            return this.jwtService.verify(token, {secret});
        } catch (e) {
            throw new UnauthorizedException('Невалидный токен')
        }
    }
}
