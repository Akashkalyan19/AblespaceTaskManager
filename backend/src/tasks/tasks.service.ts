import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { Task } from './task.entity';
import { Comment } from './comment.entity';
import { Activity } from './activity.entity';
import { User } from '../users/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { Priority, PRIORITY_LABELS, TASK_STATUS_LABELS } from '../common/enums';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(Activity)
    private readonly activities: Repository<Activity>,
  ) {}

  /** Top-level tasks (subtasks are loaded through the detail endpoint). */
  findAll(ownerId: string, query: QueryTasksDto): Promise<Task[]> {
    const where: FindOptionsWhere<Task> = {
      ownerId,
      parentId: IsNull(),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { title: ILike(`%${query.search}%`) } : {}),
    };
    return this.tasks.find({ where, order: { createdAt: 'ASC' } });
  }

  /** Full detail: subtasks, comments and the activity feed. */
  async findOne(ownerId: string, id: string): Promise<Task> {
    const task = await this.tasks.findOne({
      where: { id, ownerId },
      relations: { subtasks: { assignee: true }, project: true },
      order: { subtasks: { createdAt: 'ASC' } },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async create(user: User, dto: CreateTaskDto): Promise<Task> {
    const task = await this.tasks.save(
      this.tasks.create({
        ...dto,
        labels: dto.labels ?? [],
        ownerId: user.id,
      }),
    );
    await this.log(task.id, user, 'created this task');
    return this.reload(task.id);
  }

  async update(user: User, id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(user.id, id);

    // Record human-readable activity entries for the "Updates" feed.
    if (dto.status && dto.status !== task.status) {
      await this.log(
        id,
        user,
        `changed status from ${TASK_STATUS_LABELS[task.status]} to ${TASK_STATUS_LABELS[dto.status]}`,
      );
    }
    if (dto.priority && dto.priority !== task.priority) {
      await this.log(
        id,
        user,
        `changed priority from ${PRIORITY_LABELS[task.priority ?? Priority.NONE]} to ${PRIORITY_LABELS[dto.priority]}`,
      );
    }
    if (dto.dueDate !== undefined && dto.dueDate !== task.dueDate) {
      await this.log(
        id,
        user,
        dto.dueDate
          ? `set the due date to ${formatDate(dto.dueDate)}`
          : 'removed the due date',
      );
    }
    if (dto.assigneeId !== undefined && dto.assigneeId !== task.assigneeId) {
      await this.log(
        id,
        user,
        dto.assigneeId ? 'changed the assignee' : 'removed the assignee',
      );
    }

    Object.assign(task, dto);
    await this.tasks.save(task);
    return this.findOne(user.id, id);
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const task = await this.findOne(ownerId, id);
    await this.tasks.remove(task);
  }

  // ---- Comments -----------------------------------------------------------

  async findComments(ownerId: string, taskId: string): Promise<Comment[]> {
    await this.findOne(ownerId, taskId); // ownership check
    return this.comments.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
  }

  async addComment(user: User, taskId: string, body: string): Promise<Comment> {
    await this.findOne(user.id, taskId);
    const comment = await this.comments.save(
      this.comments.create({ taskId, authorId: user.id, body }),
    );
    await this.log(taskId, user, 'posted an update');
    return this.comments.findOneOrFail({ where: { id: comment.id } });
  }

  // ---- Activity feed --------------------------------------------------------

  async findActivities(ownerId: string, taskId: string): Promise<Activity[]> {
    await this.findOne(ownerId, taskId);
    return this.activities.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  private async log(taskId: string, actor: User, message: string) {
    await this.activities.save(
      this.activities.create({ taskId, actorId: actor.id, message }),
    );
  }

  private reload(id: string): Promise<Task> {
    return this.tasks.findOneOrFail({ where: { id } });
  }
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
