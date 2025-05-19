/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Server } from 'node:http';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoffeesModule } from '../../src/coffees/coffees.module';
import { CreateCoffeeDto } from '../../src/coffees/dto/create-coffee.dto';
import { UpdateCoffeeDto } from '../../src/coffees/dto/update-coffee.dto';

describe('coffees', () => {
  jest.setTimeout(60000);
  const coffee: CreateCoffeeDto = {
    name: 'Coffee',
    brand: 'Brand',
    flavors: ['Flavor'],
  };
  let postgresContainer: StartedPostgreSqlContainer;
  let app: INestApplication;
  let httpServer: Server;

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
    // copy paste from main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        // remove all non listed properties in dtos
        whitelist: true,
        // 400 error if non listed properties are sent
        forbidNonWhitelisted: true,
        // from objects to Class instances
        transform: true,
        transformOptions: {
          // enable implicit conversion of primitive types
          // cf. common/dto/pagination-query.dto.ts
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  it('Create [POST /]', () => {
    return request(httpServer)
      .post('/coffees')
      .send(coffee)
      .expect(HttpStatus.CREATED);
  });

  it('Get all [GET /]', async () => {
    return request(httpServer)
      .get('/coffees')
      .then(({ body }) => {
        expect(body.length).toBeGreaterThan(0);
        expect(body[0]).toEqual({
          ...coffee,
          description: null,
          flavors: coffee.flavors.map((flavor, index) => ({
            name: flavor,
            id: index + 1,
          })),
          id: 1,
          recommendations: 0,
        });
      });
  });

  it('Get one [GET /:id]', async () => {
    return request(httpServer)
      .get('/coffees/1')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual({
          ...coffee,
          description: null,
          flavors: coffee.flavors.map((flavor, index) => ({
            name: flavor,
            id: index + 1,
          })),
          id: 1,
          recommendations: 0,
        });
      });
  });

  it('Update one [PATCH /:id]', async () => {
    const updateCoffeeDto: UpdateCoffeeDto = {
      ...coffee,
      name: 'New and Improved Shipwreck Roast',
    };
    return request(httpServer)
      .patch('/coffees/1')
      .send(updateCoffeeDto)
      .then(async ({ body }) => {
        expect(body.name).toEqual(updateCoffeeDto.name);

        return request(httpServer)
          .get('/coffees/1')
          .then(({ body }) => {
            expect(body.name).toEqual(updateCoffeeDto.name);
          });
      });
  });

  it('Delete one [DELETE /:id]', async () => {
    return request(httpServer)
      .delete('/coffees/1')
      .expect(HttpStatus.OK)
      .then(() => {
        return request(httpServer)
          .get('/coffees/1')
          .expect(HttpStatus.NOT_FOUND);
      });
  });

  afterAll(async () => {
    await app.close();
    await postgresContainer.stop();
  });
});
