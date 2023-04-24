import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {User} from "./user.model";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";

@Injectable()
export class UserService {
    constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) {}

    async getAllUsers(){
        const users = this.userRepository.findAll({include: {all: true}});
        return users;
    }

    async createUser(dto: CreateUserDto){
        const user = await this.userRepository.create(dto)
        const role = await this.roleService.getRoleByValue('USER');
        console.log(role.id)
        await user.$set('roles', role.id);
        return user;
    }
}
