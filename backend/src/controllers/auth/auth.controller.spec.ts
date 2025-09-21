import { Test, TestingModule } from '@nestjs/testing';
import { Mapper } from '@/utils/mapper/mapper';
import { HttpException } from '@nestjs/common';
import { AuthService } from '@/services/users/auth.service';
import { AuthController } from './auth.controller';
import { AuthResponseEntity } from '@/entities/auth-response.entity';
import { AuthRequestDto } from '@/dtos/auth-request.dto';
import { AuthResponseDto } from '@/dtos/auth-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let mapDataSpy: jest.SpyInstance;

  const mockAuthService: Partial<jest.Mocked<AuthService>> = {
    signIn: jest.fn(),
    signUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);

    mapDataSpy = jest
      .spyOn(Mapper, 'mapData')
      .mockImplementation((_cls, data) => data);
  });

  describe('signIn', () => {
    it('should return success response when email and password are valid and sign in', async () => {
      const email = 'example@gmail.com';
      const body = new AuthRequestDto(email, 'example1');

      const resultFromService = new AuthResponseEntity({
        success: true,
        message: 'Signed in successfully',
        email: email,
        id: 'user-uuid',
      });

      authService.signIn.mockResolvedValue(resultFromService);

      const signInMock = jest.spyOn(authService, 'signIn');

      const result = await controller.signIn(body);

      expect(signInMock).toHaveBeenCalledWith(body);
      expect(mapDataSpy).toHaveBeenCalledWith(
        AuthResponseDto,
        resultFromService,
      );

      expect(result.success).toBe(true);
      expect(result.email).toBe(email);
    });

    it('should throw an error when fails to sign in', async () => {
      const body = new AuthRequestDto('example@gmail.com', 'example1');

      authService.signIn.mockRejectedValueOnce(
        new HttpException('Sign in failed: Unknown error', 500),
      );

      const signInMock = jest.spyOn(authService, 'signIn');

      await expect(controller.signIn(body)).rejects.toThrow(
        'Sign in failed: Unknown error',
      );
      expect(signInMock).toHaveBeenCalledWith(body);
    });
  });

  describe('signUp', () => {
    it('should return success response when email does not exists and create an account', async () => {
      const email = 'example@gmail.com';
      const body = new AuthRequestDto(email, 'example1');

      const resultFromService = new AuthResponseEntity({
        success: true,
        message: 'Created an account successfully',
        email: email,
        id: 'user-uuid',
      });

      authService.signUp.mockResolvedValue(resultFromService);

      const signUpMock = jest.spyOn(authService, 'signUp');

      const result = await controller.signUp(body);

      expect(signUpMock).toHaveBeenCalledWith(body);
      expect(mapDataSpy).toHaveBeenCalledWith(
        AuthResponseDto,
        resultFromService,
      );

      expect(result.success).toBe(true);
      expect(result.email).toBe(email);
    });

    it('should throw an error when fails to create an account', async () => {
      const body = new AuthRequestDto('example@gmail.com', 'example1');

      authService.signUp.mockRejectedValueOnce(
        new HttpException('Create account failed: Unknown error', 500),
      );

      const downloadMock = jest.spyOn(authService, 'signUp');

      await expect(controller.signUp(body)).rejects.toThrow(
        'Create account failed: Unknown error',
      );
      expect(downloadMock).toHaveBeenCalledWith(body);
    });
  });
});
