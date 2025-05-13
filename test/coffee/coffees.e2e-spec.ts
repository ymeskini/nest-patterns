import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoffeesModule } from '../../src/coffees/coffees.module';

describe('coffees', () => {
  jest.setTimeout(60000);
  let postgresContainer: StartedPostgreSqlContainer;
  let app: INestApplication;

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer().start();
    const moduleRef = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: postgresContainer.getHost(),
          port: postgresContainer.getPort(),
          username: postgresContainer.getUsername(),
          password: postgresContainer.getPassword(),
          database: postgresContainer.getDatabase(),
          entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          autoLoadEntities: true,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/coffees (GET)`, () => {
    return request(app.getHttpServer()).get('/coffees').expect(200);
  });

  it.todo('Create [POST /]');
  it.todo('Get all [GET /]');
  it.todo('Get one [GET /:id]');
  it.todo('Update one [PATCH /:id]');
  it.todo('Delete one [DELETE /:id]');

  afterAll(async () => {
    await app.close();
    await postgresContainer.stop();
  });
});
