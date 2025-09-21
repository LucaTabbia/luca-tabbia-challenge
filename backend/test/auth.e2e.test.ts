import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/modules/auth.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { App } from 'supertest/types';
import { AuthResponseEntity } from '@/entities/auth-response.entity';
import { AuthRequestDto } from '@/dtos/auth-request.dto';
import { Server } from 'node:http';
import type { Response } from 'supertest';

describe('AuthController (E2E)', () => {
  let app: INestApplication<App>;
  let server: Server;

  const mockUserRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<User>>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    server = app.getHttpServer() as Server;

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  const validUser = {
    id: 'uuid-1234',
    email: 'test@example.com',
    password: bcrypt.hashSync('secret', 10),
  };

  const authBody = new AuthRequestDto('test@example.com', 'secret');

  it('/auth/signIn (POST) should sign in successfully', async () => {
    mockUserRepo.findOne.mockResolvedValue(validUser);

    const res = await request(server)
      .post('/auth/signIn')
      .send(authBody)
      .expect(HttpStatus.CREATED);

    const body = res.body as AuthResponseEntity;

    expect(body.success).toBe(true);
    expect(body.email).toBe(validUser.email);
  });

  it('/auth/signIn (POST) should throw error due to missing body', async () => {
    await request(server)
      .post('/auth/signIn')
      .send({})
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/auth/signIn (POST) should throw error for wrong email', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);

    await request(server)
      .post('/auth/signIn')
      .send(new AuthRequestDto('wrong@example.com', 'secret'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((res: Response) => {
        const body = res.body as unknown as UnauthorizedException;
        expect(body.message).toContain('Invalid credentials');
      });
  });

  it('/auth/signIn (POST) should throw error for wrong password', async () => {
    mockUserRepo.findOne.mockResolvedValue(validUser);

    await request(server)
      .post('/auth/signIn')
      .send(new AuthRequestDto('wrong@example.com', 'wrongpass'))
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((res: Response) => {
        const body = res.body as UnauthorizedException;
        expect(body.message).toContain('Invalid credentials');
      });
  });

  it('/auth/signUp (POST) should create an account successfully', async () => {
    mockUserRepo.findOneBy.mockResolvedValue(null);
    mockUserRepo.create.mockReturnValue(validUser);
    mockUserRepo.save.mockResolvedValue(validUser);

    const res = await request(server)
      .post('/auth/signUp')
      .send(authBody)
      .expect(HttpStatus.CREATED);

    const body = res.body as AuthResponseEntity;

    expect(body.success).toBe(true);
    expect(body.email).toBe(validUser.email);
  });

  it('/auth/signUp (POST) should throw error due to missing body', async () => {
    await request(server)
      .post('/auth/signUp')
      .send({})
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/auth/signUp (POST) should throw error for existing email', async () => {
    mockUserRepo.findOneBy.mockResolvedValue(validUser);

    await request(server)
      .post('/auth/signUp')
      .send(authBody)
      .expect(HttpStatus.CONFLICT)
      .expect((res: Response) => {
        const body = res.body as ConflictException;
        expect(body.message).toContain('Email already in use');
      });
  });

  it('should reject invalid email', async () => {
    await request(server)
      .post('/auth/signin')
      .send({ email: 'invalid-email', password: 'validPass1' })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res: Response) => {
        const body = res.body as BadRequestException;
        expect(body.message).toContain('email must be an email');
      });;;
  });

  it('should reject short password', async () => {
    await request(server)
      .post('/auth/signin')
      .send(new AuthRequestDto('test@example.com', '123'))
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res: Response) => {
        const body = res.body as BadRequestException;
        expect(body.message).toContain('password must be longer than or equal to 6 characters');
      });;
  });
});
