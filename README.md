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



# Debugging Common Errors

Run `NEST_DEBUG=true npm run start:dev` in your terminal
To find potential circular dependencies run
```shell
npx madge dist/main.js --circular
# or create image
npx madge dist/main.js --image graph.png
```
cf. `graph.png` in the root folder

Try naming the injected class with `Symbol`
```typescript
export const COFFEES_DATA_SOURCE = Symbol('COFFEES_DATA_SOURCE');

@Injectable()
export class CoffeesService {
  constructor(@Inject(COFFEES_DATA_SOURCE) private readonly dataSource: DataSource[]) {}
}
```


# Implicit vs Explicit Dependency Injection
It's the difference wether we use the `@Inject()` decorator or not.
Or if we use the `@Injectable()` decorator or not in the class.

# Lazy-loading Modules
cf. https://docs.nestjs.com/fundamentals/lazy-loading-modules
// ⚙️ Generate a new "rewards" module:
```shell
nest g mo rewards --skip-import

// ⚙️ Generate a single RewardsService within that module:
nest g s rewards
```

```typescript
// 📝 coffees.service.ts
// Inject the new `LazyModuleLoader` provider using the standard approach
@Injectable()
export class CoffeesService {
  constructor(
    @Inject(COFFEES_DATA_SOURCE) dataSource: CoffeesDataSource,
    private readonly lazyModuleLoader: LazyModuleLoader,
  ) {}

  async create(createCoffeeDto: CreateCoffeeDto) {
    // Lazy load RewardsModule
    const rewardsModuleRef = await this.lazyModuleLoader.load(() =>
      import('../rewards/rewards.module').then((m) => m.RewardsModule),
    );
    const { RewardsService } = await import('../rewards/rewards.service');
    const rewardsService = rewardsModuleRef.get(RewardsService);
    rewardsService.grantTo();
    return 'This action adds a new coffee';
  }

  // ...
}

// 📝 rewards.service.ts - Create grantTo method
grantTo() {
  console.log('Hello from the lazy-loaded RewardsService 👋');
}


/**
 * Open up a separate terminal window and use CURL to call our POST /coffees endpoint, just to test everything out:
 **/
curl -H 'content-type: application/json' localhost:3000/coffees -d "{}"

// ---
// 📝 coffees.service.ts  - Add console time/timeEnd
async create(createCoffeeDto: CreateCoffeeDto) {
  console.time(); // 👈
  const rewardsModuleRef = await this.lazyModuleLoader.load(() =>
    import('../rewards/rewards.module').then((m) => m.RewardsModule),
  );
  const { RewardsService } = await import('../rewards/rewards.service');
  const rewardsService = rewardsModuleRef.get(RewardsService);
  console.timeEnd(); // 👈
  rewardsService.grantTo();
  return 'This action adds a new coffee';
}
```


# Access IoC Containers

Let's implement schedule service accessing other containers

```shell
nest g mo scheduler

nest g class scheduler/interval.scheduler

// - generate CRON module & Service
nest g mo cron
nest g s cron
```

```typescript
// -------------------------
// 📝 FINAL - IntervalScheduler file
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { INTERVAL_HOST_KEY } from '../decorators/interval-host.decorator';
import { INTERVAL_KEY } from '../decorators/interval.decorator';

@Injectable()
export class IntervalScheduler
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly intervals: NodeJS.Timer[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onApplicationBootstrap() {
    const providers = this.discoveryService.getProviders();
    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      const prototype = instance && Object.getPrototypeOf(instance);
      if (!instance || !prototype) {
        return;
      }
      const isIntervalHost =
        this.reflector.get(INTERVAL_HOST_KEY, instance.constructor) ?? false;
      if (!isIntervalHost) {
        return;
      }
      const methodKeys = this.metadataScanner.getAllMethodNames(prototype);
      methodKeys.forEach((methodKey) => {
        const interval = this.reflector.get(INTERVAL_KEY, instance[methodKey]);
        if (interval === undefined) {
          return;
        }
        const intervalRef = setInterval(() => instance[methodKey](), interval);
        this.intervals.push(intervalRef);
      });
    });
  }

  onApplicationShutdown(signal?: string) {
    this.intervals.forEach((intervalRef) => clearInterval(intervalRef));
  }
}

// -------------------------
// 📝 FINAL - interval-host.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const INTERVAL_HOST_KEY = 'INTERVAL_HOST_KEY';
export const IntervalHost: ClassDecorator = SetMetadata(
  INTERVAL_HOST_KEY,
  true,
);

// -------------------------
// 📝 FINAL - interval.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const INTERVAL_KEY = 'INTERVAL_KEY';
export const Interval = (ms: number) => SetMetadata(INTERVAL_KEY, ms);

// -------------------------
// 📝 FINAL - cron.service.ts
import { IntervalHost } from '../scheduler/decorators/interval-host.decorator';
import { Interval } from '../scheduler/decorators/interval.decorator';

@IntervalHost
export class CronService {
  @Interval(1000) // 👈
  everySecond() {
    console.log('This will be logged every second 🐈 ');
  }
}
```


# Worker Threads
Worker Threads - help us offload CPU-intensive tasks - away from the Event Loop - so that they can be executed parallelly - in a non-blocking manner. Although - they do not help us much with I/O (or input/output) intensive work, since the Node.js built-in asynchronous I/O operations are much more efficient themselves.

Each worker thread has its own isolated V8 environment, context, event loop, event queue, etc. However, they can share memory. They can do so by transferring ArrayBuffer instances or sharing SharedArrayBuffer instances with one another. Also, a worker and parent can communicate with each other through a messaging channel.

Note that in Node.js it’s important to differentiate between CPU-intensive, long-running, event-loop blocking operations, and I/O (input/output) operations (such as HTTP requests, querying the database, etc).

```shell
npm i piscina
nest g mo fibonacci
nest g controller fibonacci
```

```typescript
// -------------------
// 📝 FINAL - fibonacci.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import Piscina from 'piscina';
import { resolve } from 'path';

@Controller('fibonacci')
export class FibonacciController {
  fibonacciWorker = new Piscina({
    filename: resolve(__dirname, 'fibonacci.worker.js'),
  });

  @Get()
  fibonacci(@Query('n') n = 10) {
    return this.fibonacciWorker.run(n);
  }
}

// ** Access fibonacci endpoint with CURL
curl -X GET -w "\nTime total: %{time_total}s\n" "localhost:3000/fibonacci/?n=41"

// -------------------
// 📝 FINAL - fibonacci.worker.ts
function fib(n: number) {
  if (n < 2) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

module.exports = (n: number) => {
  return fib(n);
};

// -------------------
// 📝 FINAL - fibonacci-worker.host.ts
import { Worker } from 'node:worker_threads';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { filter, firstValueFrom, fromEvent, map, Observable } from 'rxjs';

@Injectable()
export class FibonacciWorkerHost
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private worker: Worker;
  private message$: Observable<{ id: string; result: number }>;

  onApplicationBootstrap() {
    this.worker = new Worker(join(__dirname, 'fibonacci.worker.js'));
    this.message$ = fromEvent(this.worker, 'message') as Observable<{
      id: string;
      result: number;
    }>;
  }

  async onApplicationShutdown() {
    this.worker.terminate();
  }

  run(n: number) {
    const uniqueId = randomUUID();
    this.worker.postMessage({ n, id: uniqueId });
    return firstValueFrom(
      // convert our Observable to a Promise
      this.message$.pipe(
        filter(({ id }) => id === uniqueId), // filter out messages by IDs
        map(({ result }) => result), // pluck result value
      ),
    );
  }
}

// -------------------
// 📝 FINAL - fibonacci.module.ts - ensure FibonacciWorkerHost is added to providers
providers: [FibonacciWorkerHost]

// -------------------
// 📝 FINAL - fibonacci.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import Piscina from 'piscina';
import { resolve } from 'path';

@Controller('fibonacci')
export class FibonacciController {
  fibonacciWorker = new Piscina({
    filename: resolve(__dirname, 'fibonacci.worker.js'),
  });

  @Get()
  fibonacci(@Query('n') n = 10) {
    return this.fibonacciWorker.run(n);
  }
}
```


```terminal
// ** Call endpoint once again with CURL
curl -X GET -w "\nTime total: %{time_total}s\n" "localhost:3000/fibonacci/?n=41"

curl -X GET -w "\nTime total: %{time_total}s\n" "localhost:3000/fibonacci/?n=60"

// to see if endpoint is still responsive
curl -X GET -w "\nTime total: %{time_total}s\n" "localhost:3000"
```


# Create a configurable module
Manually creating highly configurable, dynamic modules that expose async methods (be it registerAsync, forRootAsync) is quite complicated, especially for newcomers! You may have seen methods like these when working with official Nest packages such as "@nestjs/typeorm", "@nestjs/graphql", et cetera). In these packages you have certainly done things like TypeOrmModule.forRoot (or forRootAsync) when working with them.

If you have ever tried to create your own DynamicModule that accomplishes similar things, you may have realized it's not very straightforward and involves quite a bit of boilerplate! This is why Nest exposes a somewhat new class called the ConfigurableModuleBuilder. Which helps us facilitate and simplify this entire process, and lets us construct a module "blueprint" - all in just a few lines of code. While creating basic configurable modules is a pretty straightforward process, leveraging all the built-in features of the ConfigurableModuleBuilder might not be that obvious!


```typescript
// ⚙️ Terminal
nest g mo http-client

// ----------------
// 📝 FINAL - http-client.module-definition.ts
import { ConfigurableModuleBuilder } from '@nestjs/common';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: HTTP_MODULE_OPTIONS,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<{
  baseUrl?: string;
}>({ alwaysTransient: true })
  // .setClassMethodName('forRoot')
  // .setFactoryMethodName('resolve')
  .setExtras<{ isGlobal?: boolean }>(
    {
      isGlobal: true,
    },
    (definition, extras) => ({
      ...definition,
      global: extras.isGlobal,
    }),
  )
  .build();

// ----------------
// 📝 FINAL - http-client.moduele.ts
import { DynamicModule, Inject, Module } from '@nestjs/common';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  HTTP_MODULE_OPTIONS,
  OPTIONS_TYPE,
} from './http-client.module-definition';

@Module({})
export class HttpClientModule extends ConfigurableModuleClass {
  constructor(@Inject(HTTP_MODULE_OPTIONS) private options) {
    console.log(options);
    super();
  }

  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      // your custom logic here
      ...super.register(options),
    };
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      // your custom logic here
      ...super.registerAsync(options),
    };
  }
}

// --------
// 📝 app.module.ts - Using the HttpClientModule
@Module({
  imports: [
   // ...
    HttpClientModule.register({ baseUrl: 'http://nestjs.com' }), // 👈
    // ⚠️  Alternatively:
    // HttpClientModule.registerAsync({
    //   useFactory: () => ({ baseUrl: 'http://nestjs.com' }),
    // }),
  ],
  // ...
})
export class AppModule {}
```


# Composition with Mixins

It's very useful to create common logic and keeping the way of writing classes with decorators in NestJS.

```typescript
// ⚙️ - Terminal
nest g class common/mixins/with-uuid.mixin

// -----------
// 📝 FINAL - with-uuid.mixin.ts
import { Type } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export function WithUuid<TBase extends Type>(Base: TBase) {
  return class extends Base {
    uuid = randomUUID();

    regenerateUuid() {
      this.uuid = randomUUID();
    }
  };
}

// -----------
// 📝 FINAL - coffee.entity.ts
import { WithUuid } from '../../common/mixins/with-uuid.mixin/with-uuid.mixin';

export class Coffee {
  constructor(public name: string) {}
}

const CoffeeWithUuidCls = WithUuid(Coffee); // 👈 use the new WithUuid mixin
const coffee = new CoffeeWithUuidCls('Buddy Brew');

// ------------
// ⚙️ - Terminal - generate Entity exists Pipe
nest g pipe common/pipes/entity-exists

// -----------
// 📝 FINAL - entity-exists.pipe.ts
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  PipeTransform,
  Type,
} from '@nestjs/common';

export function EntityExistsPipe(entityCls: Type): Type<PipeTransform> {
  @Injectable()
  class EntityExistsPipeCls implements PipeTransform {
    constructor(
      @Inject(entityCls)
      private entityRepository: { exists(condition: unknown): Promise<void> },
    ) {}

    async transform(value: any, metadata: ArgumentMetadata) {
      await this.entityRepository.exists({ where: { id: value } }); // throws if entity does not exist
      return value;
    }
  }
  return EntityExistsPipeCls;
}

// 📝 - Coffees.controller.ts
@Patch(':id')
update(
  @Param('id', EntityExistsPipe(Coffee)) id: string, // 👈 example of using the new Pipe (comment out next line)
  // @Param('id') id: string,
  @Body() updateCoffeeDto: UpdateCoffeeDto,
) {
  return this.coffeesService.update(+id, updateCoffeeDto);
}

/**
 * NOTE: Before we finish, let's make sure we comment that line out as it was all the pseudo-code -
 * since we don't have an ORM setup in our application.
 **/
```

# Schematics
A schematic is a template-based code generator that is a set of instructions for transforming a software project by generating or modifying code.

Angular Devkit Schematics were introduced by the Angular team in 2018. However, even though schematics were developed by the Angular team, and despite the word angular being in the "name" - anyone can still use them, in any sense, to generate any type of code, as they are platform independent. (so you could generate anything whether it's NestJS, React, Vue, etc).

We can utilize these schematics to enforce architectural rules and conventions, making our projects consistent and inter-operative. Or we could create schematics to help us generate commonly-used code - shared services, modules, interfaces, health checks, docker files etc.

For a more real-world example, with the help of schematics, we could reduce the amount of time we might need to setup all the boilerplate for creating a new microservice within our organization by creating a microservice schematic that generates all of the common code / loggers / tools / etc that we might commonly use in our organizations microservices.

## Generate a new schematic

In schematics, the virtual file system is represented by a Tree. A Tree data structure contains a base (or a set of files that already exists), as well as a staging area (which is a list of changes to be applied to that base).

When making modifications, we don't actually change the base itself, but add those modifications to the staging area.

A Rule object - defines a function that takes a Tree, applies transformations (more on transformations in a moment), and returns a new Tree. The main file for a schematic, which is that index.ts file, defines a set of rules that implement the schematic's logic.

A transformation is represented by an Action - of which there are four action types: Create, Rename, Overwrite, and Delete.

Each schematic runs in a context, represented by a SchematicContext object.

```typescript
// ⚙️ Terminal - generate blank schematic using npx
npx @angular-devkit/schematics-cli blank --name=schematics
/** Note: we're going to use npx here,
 *  but note that alternatively - you could install the "@angular-devkit/schematics-cli" package globally
 *  and refer to it as "schematics" instead of using npx - if you prefer.
 **/

// 🏗 Install required dev dependency
npm i @schematics/angular -D

// 🏗 Build the app in "watch" mode
npm run build -- --watch

// ⚙️ Terminal - TO EXECUTE THE SCHEMATIC (when you are ready)
npx @angular-devkit/schematics-cli ./schematics:configurable-module
// NOTE: --debug=false (needed to actually "run" it), it is debug=true by default

// ----------
// 📝 FINAL - schematics collections.json
{
  "$schema": "../node_modules/@angular-devkit/schematics/collection-schema.json",
  "schematics": {
    "configurable-module": {
      "description": "Generates a configurable module.",
      "factory": "./configurable-module/index#generate",
      "schema": "./configurable-module/schema.json"
    }
  }
}


// ----------
// 📝 FINAL - index.ts (configurable-module)
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import {
  apply,
  chain,
  externalSchematic,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  strings,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { findNodes, insertImport } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';

interface ConfigurableModuleSchematicOptions {
  name: string;
}

function updateModuleFile(
  tree: Tree,
  options: ConfigurableModuleSchematicOptions,
): Tree {
  const name = dasherize(options.name);
  const moduleFilePath = `src/${name}/${name}.module.ts`;
  const moduleFileContent = tree.readText(moduleFilePath);
  const source = ts.createSourceFile(
    moduleFilePath,
    moduleFileContent,
    ts.ScriptTarget.Latest, // use the latest TypeScript version
    true,
  );
  const updateRecorder = tree.beginUpdate(moduleFilePath);
  const insertImportChange = insertImport(
    source,
    moduleFilePath,
    'ConfigurableModuleClass',
    `./${name}.module-definition`,
  );
  if (insertImportChange instanceof InsertChange) {
    updateRecorder.insertRight(
      insertImportChange.pos,
      insertImportChange.toAdd,
    );
  }
  const classNode = findNodes(source, ts.SyntaxKind.ClassDeclaration)[0];
  updateRecorder.insertRight(
    classNode.end - 2,
    'extends ConfigurableModuleClass ',
  );
  tree.commitUpdate(updateRecorder);

  return tree;
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function generate(options: ConfigurableModuleSchematicOptions): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    const templateSource = apply(url('./files'), [
      template({ ...options, ...strings }),
      move('src'),
    ]);

    return chain([
      externalSchematic('@nestjs/schematics', 'module', {
        name: options.name,
      }),
      mergeWith(templateSource),
      (tree) => updateModuleFile(tree, options),
    ]);
  };
}

// ----------
// 📝 FINAL - files / __name@dasherize__.module-definition.ts
import { ConfigurableModuleBuilder } from '@nestjs/common';

export const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder().build();

// ----------
// 📝 FINAL - schema.json
{
  "$schema": "http://json-schema.org/schema",
  "$id": "configurable-module",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The name of the module.",
      "$default": {
        "$source": "argv",
        "index": 0
      },
      "x-prompt": "What name would you like to use for the module?"
    }
  },
  "required": ["name"]
}
```
