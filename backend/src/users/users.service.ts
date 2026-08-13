import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  /** Assignee options shown in member pickers. */
  findDemoMembers(): Promise<User[]> {
    return this.users.find({
      where: { isDemoMember: true },
      order: { name: 'ASC' },
    });
  }

  async updateProfile(user: User, dto: UpdateProfileDto): Promise<User> {
    if (dto.email && dto.email !== user.email) {
      const taken = await this.users.findOne({
        where: { email: dto.email, id: Not(user.id) },
      });
      if (taken) {
        throw new ConflictException('That email is already in use');
      }
    }
    Object.assign(user, dto);
    return this.users.save(user);
  }

  async deleteAccount(user: User): Promise<void> {
    // Cascades remove the guest's projects, tasks, comments and activities.
    await this.users.delete(user.id);
  }
}
