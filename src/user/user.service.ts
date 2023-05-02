import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import { Roles } from '../roles/roles.model';
import { AddRoleDto } from './dto/add-role.dto';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService,
  ) {}

  async getAllUsers() {
    const users = await this.userRepository.findAll({ include: { all: true } });
    return users;
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto);
    const role = await this.roleService.getRoleByValue('USER');
    await user.$set('roles', role.id);
    user.roles = role; //Костыль, чтобы в возвращаем объекте была роль
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
      include: {
        model: Roles,
      },
    });
    return user;
  }

  async getUserById(id: number) {
    return await this.userRepository.findOne({ where: { id: id } });
  }

  async deleteUser(id: number){
    return await this.userRepository.destroy({where: {id: id}})
  }

  async addRole(dto: AddRoleDto) {
    const user = await this.userRepository.findByPk(dto.userId);
    const role = await this.roleService.getRoleByValue(dto.value);
    if (role && user) {
      console.log(role.id);
      await user.update({ roleId: role.id });
      return;
    }
    throw new NotFoundException('Пользователь или роль не найдены');
  }

  async ban(dto: BanUserDto) {
    const user = await this.userRepository.findByPk(dto.userId);
    if (user) {
      user.banned = true;
      await user.save();
      return;
    }
    throw new NotFoundException('Пользователь не найден');
  }
}
