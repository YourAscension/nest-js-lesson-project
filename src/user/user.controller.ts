import {
  Body,
  Controller, Delete,
  Get, HttpCode, HttpStatus, NotFoundException,
  Param,
  Post,
  UseGuards,
  UsePipes /*, ValidationPipe*/,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from './user.model';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../roles/roles-auth.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { AddRoleDto } from './dto/add-role.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { ValidationPipe } from '../pipes/validation.pipe';

@ApiTags('Пользователи')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    const user = await this.userService.getUserById(id);
    if(!user){
      throw new NotFoundException('Пользователь не найден')
    }
    return user;
  }

  @Post()
  async createUser(@Body() userDto: CreateUserDto) {
    return await this.userService.createUser(userDto);
  }
  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id') id: number){
    const deletedUser = await this.userService.deleteUser(id);
    if (!deletedUser){
      throw new NotFoundException('Пользователь не найден')
    }
    return
  }

  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Role('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Выдать роль' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Role('ADMIN')
  // @UseGuards(RolesGuard)
  @Post('/role')
  addRole(@Body() dto: AddRoleDto) {
    return this.userService.addRole(dto);
  }
  @ApiOperation({ summary: 'Забанить пользователя' })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Role('ADMIN')
  // @UseGuards(RolesGuard)
  @Post('/ban')
  ban(@Body() dto: BanUserDto) {
    return this.userService.ban(dto);
  }
}
