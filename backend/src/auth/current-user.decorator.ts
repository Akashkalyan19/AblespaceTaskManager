import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../users/user.entity';

/** Injects the authenticated user (set by JwtStrategy) into a handler param. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);
