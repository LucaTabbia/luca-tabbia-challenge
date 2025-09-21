import { AuthRequestDto } from '@/dtos/auth-request.dto';
import { User } from '@/entities/user.entity';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  AuthResponseEntity,
  IAuthResponseEntity,
} from '@/entities/auth-response.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async signUp(authRequest: AuthRequestDto): Promise<IAuthResponseEntity> {
    try {
      const existing = await this.userRepo.findOneBy({
        email: authRequest.email,
      });
      if (existing) throw new ConflictException('Email already in use');

      const hashed = await bcrypt.hash(authRequest.password, 10);
      const user = this.userRepo.create({
        email: authRequest.email,
        password: hashed,
      });
      await this.userRepo.save(user);

      return new AuthResponseEntity({
        success: true,
        message: 'Created an account successfully',
        email: user.email,
        id: user.id,
      });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(
        'Create account failed: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signIn(authRequest: AuthRequestDto): Promise<IAuthResponseEntity> {
    try {
      const user = await this.userRepo.findOne({
        where: { email: authRequest.email },
      });
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const isValid = await bcrypt.compare(authRequest.password, user.password);
      if (!isValid) throw new UnauthorizedException('Invalid credentials');

      return new AuthResponseEntity({
        success: true,
        message: 'Signed in successfully',
        email: user.email,
        id: user.id,
      });
    } catch (error) {
      let message = 'Unknown error';
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof Error) {
        message = error.message;
      }
      throw new HttpException(
        'Sign in failed: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
