import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Comment } from './comment.entity';
import { Activity } from './activity.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment, Activity])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
