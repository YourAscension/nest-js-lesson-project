import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { TokenService } from '../token/token.service';
import { CreateTokenDto } from '../token/dto/create-token.dto';
import { plainToClass } from 'class-transformer';
import { BadRequestMessages, UnauthorizedMessages } from '../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async login(userDto: CreateUserDto) {
    const user = await this.validateUser(userDto);
    const tokens = await this.tokenService.generateTokens(user);

    const tokenDto = plainToClass(CreateTokenDto, {
      userId: user.id,
      token: tokens.refreshToken.split(' ')[1],
    });
    await this.tokenService.create(tokenDto);

    return { user, tokens };
  }

  async registration(userDto: CreateUserDto) {
    let user = await this.userService.getUserByEmail(userDto.email);
    if (user) {
      throw new BadRequestException(BadRequestMessages.USER_ALREADY_EXISTS);
    }
    const hashPassword = await bcrypt.hash(userDto.password, 5);
    user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });
    return user;
  }

  private async validateUser(userDto: CreateUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);

    if (!user) {
      throw new UnauthorizedException(
        UnauthorizedMessages.WRONG_EMAIL_OR_PASSWORD,
      );
    }
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );
    if (!passwordEquals) {
      throw new UnauthorizedException(
        UnauthorizedMessages.WRONG_EMAIL_OR_PASSWORD,
      );
    }
    return user;
  }

  async refreshToken(inputToken: string) {
    const { payload, token } = this.tokenService.verifyToken(
      inputToken,
      'refresh',
    );
    const tokenFromDb = await this.tokenService.findToken(token);

    if (!payload || !tokenFromDb) {
      throw new UnauthorizedException(UnauthorizedMessages.USER_NOT_AUTHORIZED);
    }

    const user = await this.userService.getUserById(payload.id);
    const newTokens = await this.tokenService.generateTokens(user);

    const tokenDto = plainToClass(CreateTokenDto, {
      userId: user.id,
      token: newTokens.refreshToken.split(' ')[1],
    });

    await this.tokenService.update(tokenDto, tokenFromDb.id);
    return { user, newTokens };
  }
}
