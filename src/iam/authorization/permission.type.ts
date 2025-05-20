import { CoffeePermission } from '../../coffees/coffees.permission';

export const Permission = {
  ...CoffeePermission,
};

export type PermissionType = (typeof Permission)[keyof typeof Permission];
