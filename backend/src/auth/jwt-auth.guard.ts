import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Standard passport-jwt guard; applied to every controller except auth. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
