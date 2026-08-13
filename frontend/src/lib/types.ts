/**
 * API types, kept in sync with the backend entities/enums by hand.
 * (Small enough project that sharing a package would be overkill.)
 */

export type TaskStatus = "backlog" | "todo" | "doing" | "completed" | "on_hold";
export type Priority = "none" | "urgent" | "high" | "medium" | "low";
export type ThemeMode = "light" | "dark";
export type AccentColor = "amber" | "blue" | "pink" | "rose" | "emerald" | "black";

export interface User {
  id: string;
  email: string | null;
  name: string;
  title: string | null;
  username: string | null;
  avatarColor: string;
  isGuest: boolean;
  isDemoMember: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  priority: Priority;
  dueDate: string | null;
  lead: User | null;
  leadId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  labels: string[];
  startDate: string | null;
  dueDate: string | null;
  projectId: string | null;
  project?: Project | null;
  parentId: string | null;
  subtasks?: Task[];
  assignee: User | null;
  assigneeId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  author: User | null;
  authorId: string | null;
  body: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  taskId: string;
  actor: User | null;
  actorId: string | null;
  message: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ---- Request payloads -------------------------------------------------------

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  labels?: string[];
  startDate?: string;
  dueDate?: string;
  projectId?: string;
  parentId?: string;
  assigneeId?: string;
}

export type UpdateTaskInput = Partial<{
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  labels: string[];
  startDate: string | null;
  dueDate: string | null;
  projectId: string | null;
  assigneeId: string | null;
}>;

export interface CreateProjectInput {
  name: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  leadId?: string;
}

export type UpdateProjectInput = Partial<
  Omit<CreateProjectInput, "dueDate" | "leadId">
> & {
  dueDate?: string | null;
  leadId?: string | null;
};

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  title?: string;
  username?: string;
}

// ---- Display metadata --------------------------------------------------------

export const TASK_STATUSES: TaskStatus[] = [
  "todo",
  "doing",
  "completed",
  "on_hold",
  "backlog",
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  doing: "Doing",
  completed: "Completed",
  on_hold: "On Hold",
};

export const PRIORITIES: Priority[] = ["none", "urgent", "high", "medium", "low"];

export const PRIORITY_LABELS: Record<Priority, string> = {
  none: "No Priority",
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const ACCENT_COLORS: { value: AccentColor; label: string; swatch: string }[] = [
  { value: "amber", label: "Amber", swatch: "#d97706" },
  { value: "blue", label: "Blue", swatch: "#7c3aed" },
  { value: "pink", label: "Pink", swatch: "#db2777" },
  { value: "rose", label: "Rose", swatch: "#e11d48" },
  { value: "emerald", label: "Emerald", swatch: "#059669" },
  { value: "black", label: "Black", swatch: "#18181b" },
];
