import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CoffeesService } from './coffees.service';
import { Flavor } from './entities/flavor.entity';
import { Coffee } from './entities/coffee.entity';
import coffeesConfig from './config/coffees.config';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

describe('CoffeesService', () => {
  let service: CoffeesService;
  let coffeeRepository: MockRepository<Coffee>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoffeesService,
        { provide: DataSource, useValue: {} },
        {
          provide: getRepositoryToken(Flavor),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Coffee),
          useValue: createMockRepository(),
        },
        {
          provide: coffeesConfig.KEY,
          useValue: {
            foo: 'bar',
          },
        },
      ],
    }).compile();

    service = module.get<CoffeesService>(CoffeesService);
    coffeeRepository = module.get<MockRepository<Coffee>>(
      getRepositoryToken(Coffee),
    );
    // for transient/request providers use
    // service = await module.resolve(CoffeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    describe('when coffee with id exists', () => {
      it('should return the coffee', async () => {
        const coffeeId = 1;
        const expectedCoffee = {};

        coffeeRepository.findOne?.mockResolvedValue(expectedCoffee);

        const coffee = await service.findOne(coffeeId);
        expect(coffee).toEqual(expectedCoffee);
      });
    });
    describe('otherwise', () => {
      it('should throw a NotFoundException', async () => {
        const coffeeId = 1;
        coffeeRepository.findOne?.mockResolvedValue(null);

        try {
          await service.findOne(coffeeId);
          expect(false).toBeTruthy(); // we should never get here
        } catch (err: unknown) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect((err as NotFoundException).message).toEqual(
            `Coffee with id ${coffeeId} not found`,
          );
        }
      });
    });
  });
});
