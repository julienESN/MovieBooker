import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ValidationPipe } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with registerDto', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const expectedResult = {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
        access_token: 'jwt-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await authController.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login with loginDto', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
        },
        access_token: 'jwt-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
