import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { Comment } from '../tasks/comment.entity';
import { Activity } from '../tasks/activity.entity';
import { DEMO_MEMBERS, DEMO_PROJECTS, DEMO_TASKS } from '../database/demo-data';

const AVATAR_COLORS = [
  '#7c3aed',
  '#0ea5e9',
  '#db2777',
  '#dc2626',
  '#059669',
  '#d97706',
  '#4f46e5',
  '#0d9488',
];

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(Activity)
    private readonly activities: Repository<Activity>,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Guest login: creates a fresh user with its own copy of the demo data,
   * so several guests can explore the app without stepping on each other.
   */
  async loginAsGuest(name?: string) {
    const user = await this.users.save(
      this.users.create({
        name: name?.trim() || 'Guest',
        title: 'Explorer',
        username: 'guest',
        isGuest: true,
        avatarColor:
          AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      }),
    );

    await this.cloneDemoData(user);

    const accessToken = await this.jwt.signAsync({ sub: user.id });
    return { accessToken, user };
  }

  /** Copies the demo template (projects, tasks, subtasks, comments) for one owner. */
  private async cloneDemoData(owner: User): Promise<void> {
    const members = await this.ensureDemoMembers();
    const memberByEmail = new Map(members.map((m) => [m.email, m]));

    const projectByName = new Map<string, Project>();
    for (const p of DEMO_PROJECTS) {
      const project = await this.projects.save(
        this.projects.create({
          name: p.name,
          description: p.description ?? null,
          priority: p.priority,
          dueDate: p.dueDate ?? null,
          leadId: p.lead ? (memberByEmail.get(p.lead)?.id ?? null) : null,
          ownerId: owner.id,
        }),
      );
      projectByName.set(p.name, project);
    }

    for (const t of DEMO_TASKS) {
      const task = await this.tasks.save(
        this.tasks.create({
          title: t.title,
          description: t.description ?? null,
          status: t.status,
          priority: t.priority,
          labels: t.labels,
          startDate: t.startDate ?? null,
          dueDate: t.dueDate ?? null,
          projectId: t.project
            ? (projectByName.get(t.project)?.id ?? null)
            : null,
          assigneeId: t.assignee
            ? (memberByEmail.get(t.assignee)?.id ?? null)
            : null,
          ownerId: owner.id,
        }),
      );

      for (const s of t.subtasks ?? []) {
        await this.tasks.save(
          this.tasks.create({
            title: s.title,
            status: t.status,
            priority: s.priority,
            labels: [],
            dueDate: s.dueDate ?? null,
            parentId: task.id,
            assigneeId: s.assignee
              ? (memberByEmail.get(s.assignee)?.id ?? null)
              : null,
            ownerId: owner.id,
          }),
        );
      }

      for (const c of t.comments ?? []) {
        await this.comments.save(
          this.comments.create({
            taskId: task.id,
            authorId: c.author
              ? (memberByEmail.get(c.author)?.id ?? null)
              : null,
            body: c.body,
          }),
        );
      }

      for (const message of t.activities ?? []) {
        await this.activities.save(
          this.activities.create({
            taskId: task.id,
            actorId: owner.id,
            message,
          }),
        );
      }
    }
  }

  /** Demo member accounts are global; create them if the seed wasn't run. */
  private async ensureDemoMembers(): Promise<User[]> {
    const result: User[] = [];
    for (const m of DEMO_MEMBERS) {
      let member = await this.users.findOne({ where: { email: m.email } });
      if (!member) {
        member = await this.users.save(
          this.users.create({ ...m, isDemoMember: true }),
        );
      }
      result.push(member);
    }
    return result;
  }
}
