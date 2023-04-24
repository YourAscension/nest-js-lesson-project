import {Table, Column, Model, PrimaryKey, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
import {ApiProperty} from "@nestjs/swagger";
import {Roles} from "../roles/roles.model";

interface UserCreationAttribute {
    email: string;
    password: string
}

@Table({tableName: 'users-nest', timestamps: false})
export class User extends Model<User, UserCreationAttribute> {
    @ApiProperty({example: '1', description: 'ID пользователя'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true, allowNull: false})
    id: number;
    @ApiProperty({example: 'placeholder@gmail.com', description: 'Почтовый адрес'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;
    @ApiProperty({example: 'qwerty123', description: 'Пароль'})
    @Column({type: DataType.STRING, allowNull: false})
    password: string;
    @ApiProperty({example: 'true', description: 'Забанен ли'})
    @Column({type: DataType.BOOLEAN, defaultValue: false, allowNull: false})
    banned: boolean;

    @ApiProperty({example: '1', description: 'ID роли'})
    @ForeignKey(() => Roles, )
    @Column({type: DataType.INTEGER})
    roleId: number

    @ApiProperty({description: 'Роль'})
    @BelongsTo(() => Roles, { onDelete: 'cascade'})
    roles: Roles
}