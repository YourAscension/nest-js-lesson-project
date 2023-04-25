import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({example: 'test666@gmail.com', description: 'Почтовый адрес'})
    readonly email: string;
    @ApiProperty({example: 'qwerty', description: 'Пароль'})
    readonly password: string;
    @ApiProperty({example: '1', description: 'ID роли'})
    readonly roleId: number;
}