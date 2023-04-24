import {Body, Controller, Post, Get, Param} from '@nestjs/common';
import {RolesService} from "./roles.service";
import {CreateRoleDto} from "./dto/create-role.dto";
import {ApiOperation, ApiParam, ApiTags} from "@nestjs/swagger";

@ApiTags('Роли')
@Controller('roles')
export class RolesController {
    constructor(private rolesService: RolesService) {
    }

    @ApiOperation({summary: 'Создание роли'})
    @Post()
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.createRole(dto)
    }

    @ApiOperation({summary: 'Выбрать роль по значению URI параметра'})
    @ApiParam({name: 'Название роли', example: 'USER', description: 'Выберет запись у которой роль называется USER'})
    @Get('/:value')
    getByName(@Param('value') value: string){
        return this.rolesService.getRoleByValue(value);
    }
}
