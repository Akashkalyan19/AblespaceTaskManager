import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';

/**
 * One row per change shown in the "Updates" feed on the task detail page,
 * e.g. "changed priority from No priority to Urgent".
 */
@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'actorId' })
  actor: User | null;

  @Column({ type: 'uuid', nullable: true })
  actorId: string | null;

  /** Pre-rendered human-readable message. */
  @Column({ type: 'varchar', length: 500 })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
