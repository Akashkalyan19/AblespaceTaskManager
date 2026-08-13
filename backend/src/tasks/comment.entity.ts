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

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ type: 'uuid' })
  taskId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User | null;

  @Column({ type: 'uuid', nullable: true })
  authorId: string | null;

  @Column({ type: 'text' })
  body: string;

  @CreateDateColumn()
  createdAt: Date;
}
