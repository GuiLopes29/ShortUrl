import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';

const mockAuthService = () => ({
  register: jest.fn(),
  login: jest.fn(),
});

const mockUsersService = () => ({
  findOneByCriteria: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useFactory: mockAuthService },
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return user data', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };
      const user = { id: 1, email: createUserDto.email } as Partial<User>;

      jest.spyOn(service, 'register').mockResolvedValue(user);

      const result = await controller.register(createUserDto);
      expect(result).toEqual(user);
      expect(service.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { email: 'test@example.com', password: 'password' } as User;
      const token = { accessToken: 'token' };

      jest.spyOn(service, 'login').mockResolvedValue(token.accessToken);

      const result = await controller.login(user);
      expect(result).toEqual(token);
      expect(service.login).toHaveBeenCalledWith(user);
    });
  });
});
