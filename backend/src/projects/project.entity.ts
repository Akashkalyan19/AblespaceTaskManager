import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Priority } from '../common/enums';
import { User } from '../users/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: Priority, default: Priority.NONE })
  priority: Priority;

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  /** The person responsible for the project ("Lead" column in the UI). */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'leadId' })
  lead: User | null;

  @Column({ type: 'uuid', nullable: true })
  leadId: string | null;

  /** Every guest works in their own sandbox: rows are scoped by owner. */
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
