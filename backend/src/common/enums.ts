/**
 * Shared domain enums. String values are stored in Postgres enum columns,
 * so renaming a value requires a migration.
 */
export enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  DOING = 'doing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

export enum Priority {
  NONE = 'none',
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'Backlog',
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.DOING]: 'Doing',
  [TaskStatus.COMPLETED]: 'Completed',
  [TaskStatus.ON_HOLD]: 'On Hold',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  [Priority.NONE]: 'No priority',
  [Priority.URGENT]: 'Urgent',
  [Priority.HIGH]: 'High',
  [Priority.MEDIUM]: 'Medium',
  [Priority.LOW]: 'Low',
};
