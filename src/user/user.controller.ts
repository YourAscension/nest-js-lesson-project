import {Body, Controller, Get, Post, UseGuards, UsePipes/*, ValidationPipe*/} from '@nestjs/common';
import {UserService} from "./user.service";
import {CreateUserDto} from "./dto/create-user.dto";
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {User} from "./user.model";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Role} from "../roles/roles-auth.decorator";
import {RolesGuard} from "../roles/roles.guard";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
 import {ValidationPipe} from "../pipes/validation.pipe";

@ApiTags('Пользователи')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Post('test')
    async test(@Body() dto: {email:string}){
        return await this.userService.getUserByEmail(dto.email);
    }

    @ApiOperation({summary: 'Создание пользователя'})
    @ApiResponse({status: 200, type: User})
    @UsePipes(ValidationPipe)
    @Post()
    createUser(@Body() userDto: CreateUserDto) {
        return this.userService.createUser(userDto)
    }

    @ApiOperation({summary: 'Получить список пользователей'})
    @ApiResponse({status: 200, type: [User]})
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    @UseGuards(RolesGuard)
    @Get()
    getAllUsers() {
        return this.userService.getAllUsers()
    }

    @ApiOperation({summary: 'Выдать роль'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    // @UseGuards(RolesGuard)
    @Post('/role')
    addRole(@Body() dto: AddRoleDto) {
        return this.userService.addRole(dto)
    }
    @ApiOperation({summary: 'Забанить пользователя'})
    @ApiResponse({status: 200})
    @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    // @UseGuards(RolesGuard)
    @Post('/ban')
    ban(@Body() dto: BanUserDto) {
        return this.userService.ban(dto)
    }
}
