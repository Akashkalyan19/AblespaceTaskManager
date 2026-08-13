import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Guests have no email; demo member accounts use *@demo.local addresses. */
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  /** Job title shown in settings ("Designer"). */
  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  username: string | null;

  /** Hex color used for the generated avatar background. */
  @Column({ type: 'varchar', length: 7, default: '#7c3aed' })
  avatarColor: string;

  @Column({ type: 'boolean', default: false })
  isGuest: boolean;

  /** Demo members are shared, read-only assignee options for every guest. */
  @Column({ type: 'boolean', default: false })
  isDemoMember: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
