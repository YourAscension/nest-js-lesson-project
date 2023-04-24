import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {UserService} from "./user.service";
import {CreateUserDto} from "./dto/create-user.dto";
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {User} from "./user.model";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@ApiTags('Пользователи')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({summary: 'Создание пользователя'})
    @ApiResponse({status: 200, type: User})
    @Post()
    createUser(@Body() userDto: CreateUserDto){
        return this.userService.createUser(userDto)
    }

    @ApiOperation({summary: 'Получить список пользователей'})
    @ApiResponse({status: 200, type: [User]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    getAllUsers() {
        return this.userService.getAllUsers()
    }
}
