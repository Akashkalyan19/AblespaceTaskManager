import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TaskStatus } from '../src/common/enums';

/**
 * End-to-end API tests. They run against the real database configured in
 * .env, and clean up after themselves by deleting the guest accounts they
 * create (which cascades to their tasks, projects, comments and activity).
 */

// supertest types `response.body` as `any`. These shapes cover just the fields
// the assertions touch, so the tests stay type-safe and lint clean.
interface UserBody {
  id: string;
  name: string;
  title: string | null;
  isGuest: boolean;
  isDemoMember: boolean;
}

interface AuthBody {
  accessToken: string;
  user: UserBody;
}

interface TaskBody {
  id: string;
  title: string;
  status: string;
  priority: string;
  labels: string[];
  subtasks: TaskBody[];
}

interface ProjectBody {
  id: string;
  name: string;
  priority: string;
}

interface CommentBody {
  id: string;
  body: string;
}

interface ActivityBody {
  message: string;
}

/** Narrows a supertest response body to the shape the assertion expects. */
function body<T>(response: request.Response): T {
  return response.body as T;
}

describe('Task Management API (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/api/auth/guest')
      .send({ name: 'E2E Tester' })
      .expect(201);

    const created = body<AuthBody>(response);
    token = created.accessToken;
    userId = created.user.id;
  });

  afterAll(async () => {
    // Removes the guest and everything it owns.
    await request(app.getHttpServer())
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);
    await app.close();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  describe('guest login', () => {
    it('returns a token and a guest user', () => {
      expect(typeof token).toBe('string');
      expect(userId).toBeTruthy();
    });

    it('seeds the new guest with demo tasks and projects', async () => {
      const tasks = await request(app.getHttpServer())
        .get('/api/tasks')
        .set(auth())
        .expect(200);
      const projects = await request(app.getHttpServer())
        .get('/api/projects')
        .set(auth())
        .expect(200);

      expect(body<TaskBody[]>(tasks).length).toBeGreaterThan(0);
      expect(body<ProjectBody[]>(projects).length).toBe(3);
    });

    it('rejects an over-long name', () => {
      return request(app.getHttpServer())
        .post('/api/auth/guest')
        .send({ name: 'x'.repeat(101) })
        .expect(400);
    });
  });

  describe('authentication', () => {
    it('rejects requests without a token', () => {
      return request(app.getHttpServer()).get('/api/tasks').expect(401);
    });

    it('rejects an invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/tasks')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });
  });

  describe('task CRUD', () => {
    let taskId: string;

    it('creates a task', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tasks')
        .set(auth())
        .send({
          title: 'E2E task',
          status: TaskStatus.TODO,
          priority: 'high',
          labels: ['Testing'],
          dueDate: '2026-12-01',
        })
        .expect(201);

      const task = body<TaskBody>(response);
      expect(task.title).toBe('E2E task');
      expect(task.status).toBe('todo');
      expect(task.labels).toEqual(['Testing']);
      taskId = task.id;
    });

    it('reads the task back with its subtasks relation', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set(auth())
        .expect(200);

      const task = body<TaskBody>(response);
      expect(task.id).toBe(taskId);
      expect(Array.isArray(task.subtasks)).toBe(true);
    });

    it('filters tasks by search term', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?search=E2E')
        .set(auth())
        .expect(200);

      const tasks = body<TaskBody[]>(response);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(taskId);
    });

    it('updates the task and records activity', async () => {
      await request(app.getHttpServer())
        .patch(`/api/tasks/${taskId}`)
        .set(auth())
        .send({ status: TaskStatus.DOING, priority: 'urgent' })
        .expect(200);

      const activity = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}/activity`)
        .set(auth())
        .expect(200);

      const messages = body<ActivityBody[]>(activity).map((a) => a.message);
      expect(messages).toContain('changed status from To Do to Doing');
      expect(messages).toContain('changed priority from High to Urgent');
    });

    it('adds and lists comments', async () => {
      await request(app.getHttpServer())
        .post(`/api/tasks/${taskId}/comments`)
        .set(auth())
        .send({ body: 'A test comment' })
        .expect(201);

      const comments = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}/comments`)
        .set(auth())
        .expect(200);

      const list = body<CommentBody[]>(comments);
      expect(list).toHaveLength(1);
      expect(list[0].body).toBe('A test comment');
    });

    it('creates a subtask under the task', async () => {
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set(auth())
        .send({ title: 'E2E subtask', parentId: taskId })
        .expect(201);

      const detail = await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set(auth())
        .expect(200);

      const task = body<TaskBody>(detail);
      expect(task.subtasks).toHaveLength(1);
      expect(task.subtasks[0].title).toBe('E2E subtask');
    });

    it('does not list subtasks as top-level tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tasks?search=E2E')
        .set(auth())
        .expect(200);

      const tasks = body<TaskBody[]>(response);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('E2E task');
    });

    it('deletes the task', async () => {
      await request(app.getHttpServer())
        .delete(`/api/tasks/${taskId}`)
        .set(auth())
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/tasks/${taskId}`)
        .set(auth())
        .expect(404);
    });
  });

  describe('validation', () => {
    it('rejects an empty title', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .set(auth())
        .send({ title: '' })
        .expect(400);
    });

    it('rejects unknown properties', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .set(auth())
        .send({ title: 'Valid', somethingElse: true })
        .expect(400);
    });

    it('rejects an invalid status value', () => {
      return request(app.getHttpServer())
        .post('/api/tasks')
        .set(auth())
        .send({ title: 'Valid', status: 'not-a-status' })
        .expect(400);
    });

    it('rejects a malformed id', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/not-a-uuid')
        .set(auth())
        .expect(400);
    });

    it('returns 404 for a task that does not exist', () => {
      return request(app.getHttpServer())
        .get('/api/tasks/00000000-0000-4000-8000-000000000000')
        .set(auth())
        .expect(404);
    });
  });

  describe('sandbox isolation', () => {
    it("hides one guest's tasks from another", async () => {
      const other = await request(app.getHttpServer())
        .post('/api/auth/guest')
        .send({})
        .expect(201);
      const otherToken = body<AuthBody>(other).accessToken;

      const created = await request(app.getHttpServer())
        .post('/api/tasks')
        .set(auth())
        .send({ title: 'Private to first guest' })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/api/tasks/${body<TaskBody>(created).id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(204);
    });
  });

  describe('project CRUD', () => {
    let projectId: string;

    it('creates a project', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/projects')
        .set(auth())
        .send({ name: 'E2E project', priority: 'medium' })
        .expect(201);

      const project = body<ProjectBody>(response);
      expect(project.name).toBe('E2E project');
      projectId = project.id;
    });

    it('updates the project', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/projects/${projectId}`)
        .set(auth())
        .send({ priority: 'urgent' })
        .expect(200);

      expect(body<ProjectBody>(response).priority).toBe('urgent');
    });

    it('scopes tasks to a project', async () => {
      await request(app.getHttpServer())
        .post('/api/tasks')
        .set(auth())
        .send({ title: 'Scoped task', projectId })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/tasks?projectId=${projectId}`)
        .set(auth())
        .expect(200);

      const tasks = body<TaskBody[]>(response);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Scoped task');
    });

    it('deletes the project and cascades to its tasks', async () => {
      await request(app.getHttpServer())
        .delete(`/api/projects/${projectId}`)
        .set(auth())
        .expect(204);

      const response = await request(app.getHttpServer())
        .get('/api/tasks?search=Scoped')
        .set(auth())
        .expect(200);

      expect(body<TaskBody[]>(response)).toHaveLength(0);
    });
  });

  describe('profile', () => {
    it('returns the current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/me')
        .set(auth())
        .expect(200);

      const user = body<UserBody>(response);
      expect(user.id).toBe(userId);
      expect(user.isGuest).toBe(true);
    });

    it('updates the profile', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/users/me')
        .set(auth())
        .send({ name: 'Renamed Tester', title: 'QA' })
        .expect(200);

      const user = body<UserBody>(response);
      expect(user.name).toBe('Renamed Tester');
      expect(user.title).toBe('QA');
    });

    it('rejects a username containing spaces', () => {
      return request(app.getHttpServer())
        .patch('/api/users/me')
        .set(auth())
        .send({ username: 'two words' })
        .expect(400);
    });

    it('lists demo members for assignee pickers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/users/members')
        .set(auth())
        .expect(200);

      const members = body<UserBody[]>(response);
      expect(members.length).toBeGreaterThan(0);
      expect(members[0].isDemoMember).toBe(true);
    });
  });
});
