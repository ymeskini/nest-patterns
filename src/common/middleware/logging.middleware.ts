import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: () => void) {
    res.on('finish', () => {
      const { method, originalUrl, body } = req;
      const { statusCode } = res;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${body ? JSON.stringify(body) : ''}`,
      );
    });

    next();
  }
}
