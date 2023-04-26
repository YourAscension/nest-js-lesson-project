import {Table, Column, Model, DataType, BelongsToMany, HasMany} from 'sequelize-typescript';
import {ApiProperty} from "@nestjs/swagger";
import {User} from "../user/user.model";

interface RoleCreationAttribute {
    role: string
}

@Table({tableName: 'roles-nest', timestamps: false})
export class Roles extends Model<Roles, RoleCreationAttribute> {
    @ApiProperty({example: '1', description: 'ID роли'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
    id: number;
    @ApiProperty({example: 'Администратор', description: 'Название роли'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    role: string;

    @ApiProperty({description: 'Одна роль имеет множество пользователей'})
    @HasMany(()=>User)
    users: User[]
}