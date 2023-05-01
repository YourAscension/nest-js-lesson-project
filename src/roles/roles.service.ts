import { Injectable } from '@nestjs/common';
import {CreateRoleDto} from "./dto/create-role.dto";
import {InjectModel} from "@nestjs/sequelize";
import {Roles} from "./roles.model";
import {User} from "../user/user.model";

@Injectable()
export class RolesService {
    constructor(@InjectModel(Roles) private roleRepository: typeof Roles) {
    }

    async createRole(dto: CreateRoleDto){
        return await this.roleRepository.create(dto);
    }

    async getRoleByValue(value: string) {
        return await this.roleRepository.findOne({where: {role: value}})
    }

     async checkUserRole(neededRole: string, userId: number){
        return await this.roleRepository.findOne({where: {role: neededRole}, include: {model: User, where: {id: userId}}})
     }
}
