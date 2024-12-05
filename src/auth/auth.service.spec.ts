import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockUsersService = () => ({
  findOneByCriteria: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data if validation is successful', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = { email, password: await bcrypt.hash(password, 10) } as User;

      jest.spyOn(usersService, 'findOneByCriteria').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(email, password);
      expect(result).toEqual({ email });
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      const email = 'test@example.com';
      const password = 'password';

      jest.spyOn(usersService, 'findOneByCriteria').mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { email: 'test@example.com', id: 1 } as User;
      const token = 'token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.login(user);
      expect(result).toEqual(token);
    });
  });

  describe('register', () => {
    it('should create a new user and return user data', async () => {
      const createUserDto: CreateUserDto = {
        name: 'teste',
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, email: createUserDto.email } as User;

      jest.spyOn(usersService, 'findOneByCriteria').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(user);

      const result = await service.register(createUserDto);
      expect(result).toEqual({ id: user.id, email: user.email });
    });

    it('should throw ConflictException if email is already in use', async () => {
      const createUserDto: CreateUserDto = {
        name: 'teste',
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, email: createUserDto.email } as User;

      jest.spyOn(usersService, 'findOneByCriteria').mockResolvedValue(user);

      await expect(service.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
