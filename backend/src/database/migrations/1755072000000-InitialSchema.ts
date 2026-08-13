import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1755072000000 implements MigrationInterface {
  name = 'InitialSchema1755072000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "task_status_enum" AS ENUM('backlog', 'todo', 'doing', 'completed', 'on_hold')`,
    );
    await queryRunner.query(
      `CREATE TYPE "priority_enum" AS ENUM('none', 'urgent', 'high', 'medium', 'low')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying(255),
        "name" character varying(100) NOT NULL,
        "title" character varying(100),
        "username" character varying(50),
        "avatarColor" character varying(7) NOT NULL DEFAULT '#7c3aed',
        "isGuest" boolean NOT NULL DEFAULT false,
        "isDemoMember" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(200) NOT NULL,
        "description" text,
        "priority" "priority_enum" NOT NULL DEFAULT 'none',
        "dueDate" date,
        "leadId" uuid,
        "ownerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects" PRIMARY KEY ("id"),
        CONSTRAINT "FK_projects_lead" FOREIGN KEY ("leadId")
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_projects_owner" FOREIGN KEY ("ownerId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_projects_owner" ON "projects" ("ownerId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(200) NOT NULL,
        "description" text,
        "status" "task_status_enum" NOT NULL DEFAULT 'todo',
        "priority" "priority_enum" NOT NULL DEFAULT 'none',
        "labels" text array NOT NULL DEFAULT '{}',
        "startDate" date,
        "dueDate" date,
        "projectId" uuid,
        "parentId" uuid,
        "assigneeId" uuid,
        "ownerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_project" FOREIGN KEY ("projectId")
          REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_parent" FOREIGN KEY ("parentId")
          REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assigneeId")
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_owner" FOREIGN KEY ("ownerId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_project" ON "tasks" ("projectId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_parent" ON "tasks" ("parentId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_owner" ON "tasks" ("ownerId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "taskId" uuid NOT NULL,
        "authorId" uuid,
        "body" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_task" FOREIGN KEY ("taskId")
          REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_author" FOREIGN KEY ("authorId")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_task" ON "comments" ("taskId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "activities" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "taskId" uuid NOT NULL,
        "actorId" uuid,
        "message" character varying(500) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activities_task" FOREIGN KEY ("taskId")
          REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_activities_actor" FOREIGN KEY ("actorId")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_activities_task" ON "activities" ("taskId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "activities"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "priority_enum"`);
    await queryRunner.query(`DROP TYPE "task_status_enum"`);
  }
}
