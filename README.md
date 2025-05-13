Generate migration with TypeORM


cf. documentation https://typeorm.io/migrations#migrations

Create migration file
```shell
npx typeorm migration:create src/migrations/:name
```

Run migration in dev
```shell
npx typeorm-ts-node-commonjs migration:run --dataSource typeorm-cli.config.ts
```

Revert migration
```shell
npx typeorm-ts-node-commonjs migration:revert --dataSource typeorm-cli.config.ts
```

Or sync schema with the following command after changing the entities
Before doing this make sure to add all entities to `typeorm-cli.config.ts` in entities array
```shell
npx typeorm-ts-node-commonjs migration:generate src/migrations/SchemaSync -d typeorm-cli.config.ts
```

After generating migrations file, you need to add the class migration to `typeorm-cli.config.ts` in migrations array


# Dependency Injection in NestJS
First, declare a class as `@Injectable()` this mark the class as a provider
Second, we inject the class in the constructor of the class we want to use it
```typescript
constructor(private readonly myService: MyService) {}
```

Third, we need to add the class to the module providers array, so nest knows how to resolve the dependency
```typescript
@Module({
  imports: [],
  controllers: [MyController],
  providers: [MyService],
})
```

The controller first checks if there are some injected dependencies in the constructor.
Once the controller finds one, it will perform a lookup on the coffee service token which return the instance of the service.
It'll create an instance and cache it for the next time. or return the cached instance if it already exists.
This happens on the start of the application.

# Custom Modules in NestJS

## Value based providers
Useful for testing purposes, or start with inmemory data.
Example:
```typescript
class MockCoffeeService {}

@Module({
  providers: [
    {
      provide: CoffeeService,
      useValue: new MockCoffeeService(),
    },
  ],
})
```

## Non-class based provider tokens
```typescript
@Module({
  providers: [
    {
      provide: 'COFFEE_BRANDS',
      useValue: ['Starbucks', 'Costa'],
    },
  ],
})

// Injecting string-valued token into CoffeesService
@Injectable()
export class CoffeesService {
  constructor(@Inject('COFFEE_BRANDS') coffeeBrands: string[]) {}
}

/* coffees.constants.ts File for best practice */
export const COFFEE_BRANDS = 'COFFEE_BRANDS';
```

## Class Providers
```typescript
{
  provide: ConfigService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService,
},
```


## Factory Providers
```typescript
{
  provide: COFFEE_BRANDS,
  useFactory: () => {
    return ['Starbucks', 'Costa'];
  },
},
```

Or with more advanced example:
```typescript
@Injectable()
export class ConfigService {
  getCoffeeBrands() {
    return ['Starbucks', 'Costa'];
  }
}

{
  provide: COFFEE_BRANDS,
  useFactory: (configService: ConfigService) => configService.getCoffeeBrands(),
  inject: [ConfigService],
},
```

## Async Providers
The `useFactory` function can be async and become a promise.
This is useful when you need to fetch data from a database or an API before providing the value.
```typescript
{
  provide: COFFEE_BRANDS,
  useFactory: async (configService: ConfigService) => {
    const coffeeBrands = await configService.getCoffeeBrands();
    return coffeeBrands;
  },
  inject: [ConfigService],
},
```


# Dynamic Modules
```typescript
// Generate a DatabaseModule
nest g mo database

// Initial attempt at creating "CONNECTION" provider, and utilizing useValue for values */
{
  provide: 'CONNECTION',
  useValue: new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432
  }).initialize(),
}


// Creating static register() method on DatabaseModule
export class DatabaseModule {
  static register(options: DataSourceOptions): DynamicModule {  }
}

// Improved Dynamic Module way of creating CONNECTION provider
export class DatabaseModule {
  static register(options: DataSourceOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'CONNECTION',
          useValue: new DataSource(options),
        }
      ]
    }
  }
}

// Utilizing the dynamic DatabaseModule in another Modules imports: []
imports: [
  DatabaseModule.register({ // 👈 passing in dynamic values
    type: 'postgres',
    host: 'localhost',
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  })
]
```

# Control Providers Scope
Injectable is a Singleton with Scope.DEFAULT
It'll be create more than once if Scope is set to TRANSIENT or REQUEST
Scope.REUEST will create a new instance for each request

If a controller use a service with Scope.REQUEST, the controller will also be created with Scope.REQUEST
```typescript
// Scope DEFAULT - This is assumed when NO Scope is entered like so: @Injectable() */
@Injectable({ scope: Scope.DEFAULT })
export class CoffeesService {}

// -------------

/**
 * Scope TRANSIENT

 * Transient providers are NOT shared across consumers.
 * Each consumer that injects a transient provider
 * will receive a new, dedicated instance of that provider.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class CoffeesService {}

// Scope TRANSIENT with a Custom Provider
{
  provide: 'COFFEE_BRANDS',
  useFactory: () => ['buddy brew', 'nescafe'],
  scope: Scope.TRANSIENT // 👈
}

// -------------

/**
 * Scope REQUEST

 * Request scope provides a new instance of the provider
 * exclusively for each incoming request.
 */
@Injectable({ scope: Scope.REQUEST })
export class CoffeesService {}
```


# Building Blocks

- Exception filters cf. `src/common/filters/http-exception.filter.ts`
- Pipes: for transformation and validation cf `src/common/pipes/parse-int.pipe.ts`
- Guards cf. `src/common/guards/api-key.guard.ts`
- Interceptors cf. `src/common/interceptors/wrap-response.interceptor.ts`

Nest building blocks can be:
- Globally-scoped, for example in main.ts with `app.useGlobalPipes(ValidationPipe)`
- Controller-scoped, for example in a controller with `@UsePipes(ValidationPipe)`
- Method-scoped, for example in a controller method with `@UsePipes(ValidationPipe)`
- And (the bonus 4th one) Param-scoped which as we said, is available to Pipes only. `@Body(ValidationPipe)`
