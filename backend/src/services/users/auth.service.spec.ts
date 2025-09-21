import { AuthService } from './auth.service';
import { User } from '@/entities/user.entity';
import { Repository } from 'typeorm';
import {
  ConflictException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { AuthRequestDto } from '@/dtos/auth-request.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((pw: string) => `hashed-${pw}`),
  compare: jest.fn((pw: string, hash: string) =>
    Promise.resolve(hash === `hashed-${pw}`),
  ),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '1',
    email: 'test@test.com',
    password: 'hashed-secret',
  };

  const mockReq: AuthRequestDto = {
    email: 'test@test.com',
    password: 'secret',
  };

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    service = new AuthService(mockUserRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should sign in the user if email and password are correct and return a successful response', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.signIn(mockReq);

      expect(mockUserRepo["findOne"]).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
      expect(result.success).toBe(true);
      expect(result.email).toBe('test@test.com');
    });

    it('should throw an error if email is incorrect', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.signIn({ email: 'wrong@test.com', password: 'secret' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error if password is incorrect', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed-other',
      } as User;
      mockUserRepo.findOne.mockResolvedValue(user);

      await expect(service.signIn(mockReq)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle an error and throw it', async () => {
      mockUserRepo.findOne.mockRejectedValue(
        new Error('Sign in failed: Unknown Error'),
      );

      await expect(service.signIn(mockReq)).rejects.toThrow(HttpException);
    });
  });

  describe('signUp', () => {
    it('should create an account if the email does not exist and return a successful response', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await service.signUp(mockReq);

      expect(mockUserRepo["findOneBy"]).toHaveBeenCalledWith({
        email: 'test@test.com',
      });
      expect(mockUserRepo["save"]).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.email).toBe('test@test.com');
    });

    it('should throw an error if email exists in the database', async () => {
      mockUserRepo.findOneBy.mockResolvedValue(mockUser);

      await expect(service.signUp(mockReq)).rejects.toThrow(ConflictException);
    });

    it('should handle an error and throw it', async () => {
      mockUserRepo.findOneBy.mockRejectedValue(
        new Error('Create account failed: Unknown error'),
      );

      await expect(service.signUp(mockReq)).rejects.toThrow(HttpException);
    });
  });
});
