import { ApiProperty } from '@nestjs/swagger';

export class BanUserDto {
  @ApiProperty({ example: 1, description: 'ID пользователя' })
  readonly userId: number;
}
