import {Controller, Post, Body, Response} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "../user/dto/create-user.dto";
import {AuthService} from "./auth.service";

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post('/login')
    async login(@Body() userDto: CreateUserDto, @Response() res) {


        const user = await this.authService.login(userDto);

        const custRes = {id: user.user.id, email: user.user.email, accessToken: user.accessToken}
        res.cookie('refreshToken', user.refreshToken, {httpOnly: true})

        return res.status(200).json(custRes);
    }

    @Post('/registration')
    async registration(@Body() userDto: CreateUserDto) {
        return await this.authService.registration(userDto);
    }


}
