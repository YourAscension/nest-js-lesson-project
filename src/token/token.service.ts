import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Token} from "./token.model";
import {CreateTokenDto} from "./dto/create-token.dto";
import {JwtService} from "@nestjs/jwt";
import {User} from "../user/user.model";
import {UserService} from "../user/user.service";
import {CreateUserDto} from "../user/dto/create-user.dto";
import * as process from "process";
import {UnauthorizedMessages} from "../common/constants";

@Injectable()
export class TokenService {
    private readonly accessTokenOptions = {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: process.env.ACCESS_TOKEN_MINUTES + 'm'
    }
    private readonly refreshTokenOptions = {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_DAYS + 'd'
    }

    constructor(@InjectModel(Token) private tokenRepository: typeof Token, private jwtService: JwtService) {
    }


    async create(dto: CreateTokenDto) {
        const token = await this.tokenRepository.create(dto)
        return token;
    }

    async update(dto: CreateTokenDto, id: number) {
        const token = await this.tokenRepository.findByPk(id);
        if (!token) {
            throw new NotFoundException(`Token with id ${id} not found`);
        }
        token.token = dto.token;
        token.refreshCount += 1;
        token.issuedAt = dto.issuedAt;
        token.expiresIn = dto.expiresIn;
        await token.save();
        return token;
    }

    async findToken(token: string) {
        return await this.tokenRepository.findOne({where: {token: token}})
    }
    async deleteToken(token: string){
        return await this.tokenRepository.destroy({where: {token: token}})
    }

    async generateTokens(user: User) {
        const payload = {id: user.id, email: user.email}

        const tokens = {
            accessToken: 'Bearer ' + await this.jwtService.signAsync(payload, this.accessTokenOptions),
            refreshToken: 'Bearer ' + await this.jwtService.signAsync(payload, this.refreshTokenOptions)
        }
        return tokens
    }

    verifyTokenType(inputString: string){
        const [tokenType, token] = inputString.split(' ');

        if (tokenType !=='Bearer' || !token){
            throw new BadRequestException()
        }
        return token;
    }

    verifyToken(inputToken: string, tokenVariant: 'access' | 'refresh') {
        try {
            const token = this.verifyTokenType(inputToken)
            //Проверяем токен, если токен невалидный, то ошибка, если валидный - данные.
            const tokenVariantsSecret = {
                access: this.accessTokenOptions.secret,
                refresh: this.refreshTokenOptions.secret
            }
            return {payload: this.jwtService.verify(token, {secret: tokenVariantsSecret[tokenVariant]}), token}
        } catch (e) {
            throw new UnauthorizedException(UnauthorizedMessages.USER_NOT_AUTHORIZED)
        }
    }
}
