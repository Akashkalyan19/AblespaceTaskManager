import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Priority, TaskStatus } from '../common/enums';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'enum', enum: Priority, default: Priority.NONE })
  priority: Priority;

  /** Free-form label chips ("Deployment", "Design", ...). */
  @Column({ type: 'text', array: true, default: '{}' })
  labels: string[];

  @Column({ type: 'date', nullable: true })
  startDate: string | null;

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @Index()
  @ManyToOne(() => Project, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  /** Set for subtasks; deleting a parent removes its subtasks. */
  @Index()
  @ManyToOne(() => Task, (task) => task.subtasks, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Task | null;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @OneToMany(() => Task, (task) => task.parent)
  subtasks: Task[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User | null;

  @Column({ type: 'uuid', nullable: true })
  assigneeId: string | null;

  /** Sandbox owner (the logged-in guest). All queries are scoped to this. */
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'uuid' })
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
