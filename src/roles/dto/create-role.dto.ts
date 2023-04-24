import {ApiProperty} from "@nestjs/swagger";

export class CreateRoleDto {
    @ApiProperty({example: 'Администратор', description: 'Название роли'})
    readonly role: string;
}