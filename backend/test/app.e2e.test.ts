import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  const apiPath = '/hello';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`${apiPath} (GET)`, async () => {
    const response = await request(app.getHttpServer())
      .get(apiPath)
      .expect(200);

    expect(response.body).toEqual({
      message: "I'm Mr. Meeseeks, look at me!",
    });
  });
});
