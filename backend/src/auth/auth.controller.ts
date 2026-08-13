import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestLoginDto } from './dto/guest-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Creates a guest account with demo data and returns a JWT. */
  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  loginAsGuest(@Body() dto: GuestLoginDto) {
    return this.authService.loginAsGuest(dto.name);
  }
}
