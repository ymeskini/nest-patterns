import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { ActiveUserData } from '../../interfaces/active-user-data.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionType } from '../permission.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextPermissions = this.reflector.getAllAndOverride<
      PermissionType[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!contextPermissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    if (!request) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user: ActiveUserData = request[REQUEST_USER_KEY];
    return contextPermissions.every((permission) =>
      user.permissions?.includes(permission),
    );
  }
}
