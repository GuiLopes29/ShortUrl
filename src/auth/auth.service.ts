import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findOneByCriteria({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
      return result;
    }
    throw new UnauthorizedException();
  }

  async login(user: Partial<User>): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async register(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.usersService.findOneByCriteria({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const createUser = await this.usersService.create(createUserDto);

    return {
      id: createUser.id,
      email: createUser.email,
    };
  }
}
