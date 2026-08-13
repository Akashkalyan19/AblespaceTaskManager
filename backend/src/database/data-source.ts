import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { Comment } from '../tasks/comment.entity';
import { Activity } from '../tasks/activity.entity';

/**
 * Shared TypeORM configuration, used both by the Nest runtime (app.module.ts)
 * and by the TypeORM CLI for migrations (npm run migration:run).
 * Schema changes go through migrations — synchronize stays off.
 */
export const dataSourceOptions = {
  type: 'postgres' as const,
  url:
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/taskms',
  entities: [User, Project, Task, Comment, Activity],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
