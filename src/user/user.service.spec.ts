/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUsers: User[] = [
    {
      id: 1,
      email: 'user1@example.com',
      name: 'User One',
      password: 'hashedPassword1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      email: 'user2@example.com',
      name: 'User Two',
      password: 'hashedPassword2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUsersWithoutPassword = mockUsers.map(
    ({ password, ...rest }) => rest,
  );

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      const email = 'user1@example.com';
      mockUserRepository.findOne.mockResolvedValue(mockUsers[0]);

      const result = await userService.findByEmail(email);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(mockUsers[0]);
    });

    it('should return null when user is not found by email', async () => {
      const email = 'nonexistent@example.com';
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.findByEmail(email);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'hashedPassword',
      };

      const createdUser = {
        id: 3,
        ...userData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await userService.create(userData);

      expect(userRepository.create).toHaveBeenCalledWith(userData);
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return all users with sensitive data excluded', async () => {
      mockUserRepository.find.mockResolvedValue(mockUsersWithoutPassword);

      const result = await userService.findAll();

      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
      });

      result.forEach((user) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should return an empty array when no users exist', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await userService.findAll();

      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
      });
      expect(result).toEqual([]);
    });
  });
});
