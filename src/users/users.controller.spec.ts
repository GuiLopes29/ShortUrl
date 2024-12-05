import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

const mockUsersService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOneByCriteria: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockJwtService = () => ({
  decode: jest.fn().mockReturnValue({ email: 'user@example.com' }),
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const user = { ...createUserDto } as User;

      jest.spyOn(service, 'create').mockResolvedValue(user);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(user);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      ] as User[];

      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      } as User;

      jest.spyOn(service, 'findOneByCriteria').mockResolvedValue(user);

      const result = await controller.findOne('1');
      expect(result).toEqual(user);
      expect(service.findOneByCriteria).toHaveBeenCalledWith({
        id: 1,
      });
    });
  });

  describe('update', () => {
    it('should update a user by email', async () => {
      const user = {
        name: 'John Updated',
        email: 'john@example.com',
        password: 'password123',
      } as User;

      const updateUserDto: UpdateUserDto = user;

      jest.spyOn(service, 'update').mockResolvedValue(user);

      const result = await controller.update('1', updateUserDto);
      expect(result).toEqual(user);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user by email', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
