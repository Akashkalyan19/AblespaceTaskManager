import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User): User {
    return user;
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user, dto);
  }

  /** "Leave Workspace" — removes the guest account and its sandbox. */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@CurrentUser() user: User) {
    return this.usersService.deleteAccount(user);
  }

  @Get('members')
  getMembers() {
    return this.usersService.findDemoMembers();
  }
}
