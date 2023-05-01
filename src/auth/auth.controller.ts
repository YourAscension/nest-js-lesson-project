import {Controller, Post, Body, Response, Get, Request, Delete, HttpStatus} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "../user/dto/create-user.dto";
import {AuthService} from "./auth.service";
import {TokenService} from "../token/token.service";

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private tokenService: TokenService) {}

    @Post('/login')
    async login(@Body() userDto: CreateUserDto, @Response() res) {
        const {user, tokens} = await this.authService.login(userDto);
        res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        const data = {user, accessToken: tokens.accessToken}
        return res.status(200).json(data);
    }

    @Post('/registration')
    async registration(@Body() userDto: CreateUserDto) {
        return await this.authService.registration(userDto);
    }

    @Get('/refresh')
    async refresh(@Request() req, @Response() res){
        const {refreshToken} = req.cookies;
        const {user, newTokens} = await this.authService.refreshToken(refreshToken);

        res.cookie('refreshToken', newTokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        const data = {user, accessToken: newTokens.accessToken}
        return res.status(HttpStatus.OK).json(data)
    }

    @Delete('/logout')
    async logout(@Request() req, @Response() res){
        const {refreshToken} = req.cookies;
        const token = this.tokenService.verifyTokenType(refreshToken);
        await this.tokenService.deleteToken(token)
        res.clearCookie('refreshToken')
        return res.sendStatus(HttpStatus.OK)
    }
}
