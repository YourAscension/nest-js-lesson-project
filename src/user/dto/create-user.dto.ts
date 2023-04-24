import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({example: 'placeholder@gmail.com', description: 'Почтовый адрес'})
    readonly email: string;
    @ApiProperty({example: 'qwerty123', description: 'Пароль'})
    readonly password: string;
    @ApiProperty({example: '1', description: 'ID роли'})
    readonly roleId: number;
}