import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'test666@gmail.com', description: 'Почтовый адрес' })
  @IsString({ message: 'Должно быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;
  @ApiProperty({ example: 'qwerty', description: 'Пароль' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(6, 12, { message: 'Не меньше 6 и не больше 12' })
  readonly password: string;
  // @ApiProperty({example: '1', description: 'ID роли'})
  // readonly roleId: number;
}
