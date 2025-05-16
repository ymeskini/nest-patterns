import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CircuitBreaker } from './circuit-breaker';

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private readonly circuitBreakerByHandler = new WeakMap<
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    Function,
    CircuitBreaker
  >();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const methodRef = context.getHandler();

    let circuitBreaker: CircuitBreaker;
    if (this.circuitBreakerByHandler.get(methodRef)) {
      circuitBreaker = this.circuitBreakerByHandler.get(
        methodRef,
      ) as CircuitBreaker;
    } else {
      circuitBreaker = new CircuitBreaker();
      this.circuitBreakerByHandler.set(methodRef, circuitBreaker);
    }
    return circuitBreaker.exec(next);
  }
}

// usage
// @UseInterceptors(CircuitBreakerInterceptor) // 👈 use new interceptor
// @Controller()
// export class CoffeesController {
//   // ...
//   @Get()
//   findAll() {
//     console.log('🦊 "findAll" executed');
//     throw new RequestTimeoutException('💥 Error!'); // 👈
//   }
//   // ...
// }
