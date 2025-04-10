/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUsers = [
    {
      id: 1,
      email: 'user1@example.com',
      name: 'User One',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      email: 'user2@example.com',
      name: 'User Two',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUserService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should handle empty user list', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle errors from the service', async () => {
      const error = new Error('Database error');
      mockUserService.findAll.mockRejectedValue(error);

      await expect(userController.findAll()).rejects.toThrow(error);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });
});
