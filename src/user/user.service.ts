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
        await user.$set('roles', role.id);
        user.roles = role; //Костыль, чтобы в возвращаем объекте была роль
        return user;
    }

    async getUserByEmail(email: string){
        const user = await this.userRepository.findOne({where: {email: email}, include: {all: true}});
        return user;
    }
}
