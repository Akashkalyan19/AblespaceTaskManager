import { Priority, TaskStatus } from '../common/enums';

/**
 * Demo content cloned into every new guest's sandbox so the app feels real
 * on first login. Names, labels and dates mirror the Figma mock: July dates
 * are intentionally in the past so their due-date chips render as overdue.
 * A few "On Hold" cards are cut off in the mock; their titles are completed
 * with sensible guesses (documented in the README).
 */

export interface DemoMember {
  email: string;
  name: string;
  title: string;
  avatarColor: string;
}

/** Shared, read-only assignee options. Seeded once by `npm run seed`. */
export const DEMO_MEMBERS: DemoMember[] = [
  {
    email: 'admin@demo.local',
    name: 'Admin',
    title: 'Administrator',
    avatarColor: '#7c3aed',
  },
  {
    email: 'qa@demo.local',
    name: 'QA Team',
    title: 'Quality Assurance',
    avatarColor: '#0ea5e9',
  },
  {
    email: 'designer@demo.local',
    name: 'Designer',
    title: 'Product Designer',
    avatarColor: '#db2777',
  },
  {
    email: 'security@demo.local',
    name: 'Security',
    title: 'Security Engineer',
    avatarColor: '#dc2626',
  },
  {
    email: 'devteam@demo.local',
    name: 'Dev Team',
    title: 'Development',
    avatarColor: '#059669',
  },
  {
    email: 'product@demo.local',
    name: 'Product',
    title: 'Product Management',
    avatarColor: '#d97706',
  },
  {
    email: 'engineering@demo.local',
    name: 'Engineering',
    title: 'Engineering',
    avatarColor: '#4f46e5',
  },
  {
    email: 'casey@demo.local',
    name: 'Casey Nguyen',
    title: 'Developer',
    avatarColor: '#64748b',
  },
  {
    email: 'ankit@demo.local',
    name: 'Ankit Dutta',
    title: 'Developer',
    avatarColor: '#0d9488',
  },
];

interface DemoSubtask {
  title: string;
  priority: Priority;
  assignee?: string; // DEMO_MEMBERS email
  dueDate?: string;
}

interface DemoComment {
  author: string; // DEMO_MEMBERS email
  body: string;
}

export interface DemoTask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  labels: string[];
  assignee?: string;
  startDate?: string;
  dueDate?: string;
  project?: string; // DEMO_PROJECTS name
  subtasks?: DemoSubtask[];
  comments?: DemoComment[];
  activities?: string[];
}

export interface DemoProject {
  name: string;
  description?: string;
  priority: Priority;
  lead?: string;
  dueDate?: string;
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    name: 'Design Homepage',
    description: 'Redesign of the marketing site homepage.',
    priority: Priority.HIGH,
    lead: 'admin@demo.local',
    dueDate: '2026-09-12',
  },
  {
    name: 'Develop Login Feature',
    description: 'Authentication flows for the customer portal.',
    priority: Priority.LOW,
    lead: 'casey@demo.local',
    dueDate: '2026-09-15',
  },
  {
    name: 'Test Payment Gateway',
    description: 'End-to-end verification of the payment provider integration.',
    priority: Priority.MEDIUM,
    dueDate: '2026-09-18',
  },
];

export const DEMO_TASKS: DemoTask[] = [
  // ---- Board "To Do" column ------------------------------------------------
  {
    title: 'Write API Documentation',
    description:
      'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.',
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    labels: ['Research', 'Design', 'Development', 'Testing', 'Deployment'],
    assignee: 'admin@demo.local',
    startDate: '2026-01-10',
    dueDate: '2026-07-29',
    subtasks: [
      {
        title: 'Subtask 1',
        priority: Priority.HIGH,
        assignee: 'admin@demo.local',
        dueDate: '2026-09-12',
      },
      {
        title: 'Subtask 2',
        priority: Priority.LOW,
        assignee: 'casey@demo.local',
        dueDate: '2026-09-15',
      },
      { title: 'Subtask 3', priority: Priority.MEDIUM, dueDate: '2026-09-18' },
    ],
    comments: [
      {
        author: 'ankit@demo.local',
        body: 'Looks good — starting on the endpoint reference today.',
      },
    ],
    activities: [
      'created this task',
      'changed priority from No priority to High',
      'posted an update',
    ],
  },
  {
    title: 'Implement Search Function',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    labels: ['Deployment', 'Development'],
    assignee: 'admin@demo.local',
    dueDate: '2026-07-29',
    activities: ['created this task'],
  },
  {
    title: 'Deploy to Production',
    status: TaskStatus.TODO,
    priority: Priority.URGENT,
    labels: ['Deployment', 'Deployment'],
    assignee: 'admin@demo.local',
    dueDate: '2026-07-29',
    activities: ['created this task'],
  },

  // ---- Board "Doing" column ------------------------------------------------
  {
    title: 'Code Review Completed',
    status: TaskStatus.DOING,
    priority: Priority.MEDIUM,
    labels: ['Deployment', 'Development'],
    assignee: 'admin@demo.local',
    dueDate: '2026-07-29',
    activities: ['created this task'],
  },
  {
    title: 'Design Mockups Finalized',
    status: TaskStatus.DOING,
    priority: Priority.HIGH,
    labels: ['Deployment', 'Design'],
    assignee: 'admin@demo.local',
    dueDate: '2026-07-29',
    activities: ['created this task'],
  },

  // ---- Board "Completed" column ---------------------------------------------
  {
    title: 'Feature Testing Passed',
    status: TaskStatus.COMPLETED,
    priority: Priority.MEDIUM,
    labels: ['Testing', 'Passed'],
    assignee: 'qa@demo.local',
    dueDate: '2026-07-30',
    activities: ['created this task'],
  },
  {
    title: 'UI Design Updated',
    status: TaskStatus.COMPLETED,
    priority: Priority.LOW,
    labels: ['Design', 'Updated'],
    assignee: 'designer@demo.local',
    dueDate: '2026-07-31',
    activities: ['created this task'],
  },
  {
    title: 'Security Audit Scheduled',
    status: TaskStatus.COMPLETED,
    priority: Priority.HIGH,
    labels: ['Audit', 'Scheduled'],
    assignee: 'security@demo.local',
    dueDate: '2026-08-01',
    activities: ['created this task'],
  },

  // ---- Board "On Hold" column (titles partially cut in the mock) -----------
  {
    title: 'UI Review',
    status: TaskStatus.ON_HOLD,
    priority: Priority.LOW,
    labels: ['Design', 'Review'],
    assignee: 'designer@demo.local',
    dueDate: '2026-08-02',
    activities: ['created this task'],
  },
  {
    title: 'Backend Integration',
    status: TaskStatus.ON_HOLD,
    priority: Priority.HIGH,
    labels: ['Development', 'Backend'],
    assignee: 'devteam@demo.local',
    dueDate: '2026-08-03',
    activities: ['created this task'],
  },
  {
    title: 'User Feedback Round',
    status: TaskStatus.ON_HOLD,
    priority: Priority.MEDIUM,
    labels: ['Product', 'Research'],
    assignee: 'product@demo.local',
    dueDate: '2026-08-04',
    activities: ['created this task'],
  },
  {
    title: 'Performance Optimization',
    status: TaskStatus.ON_HOLD,
    priority: Priority.MEDIUM,
    labels: ['Engineering', 'Optimization'],
    assignee: 'engineering@demo.local',
    dueDate: '2026-08-05',
    activities: ['created this task'],
  },

  // ---- Rows shown in the list view, scoped to projects ----------------------
  ...projectListRows('Design Homepage'),
  ...projectListRows('Develop Login Feature'),
  ...projectListRows('Test Payment Gateway'),
];

/**
 * The list-view mock repeats the same three rows in each status group, and the
 * project-detail mock shows them again inside a project. Reproduce that here.
 */
function projectListRows(project: string): DemoTask[] {
  const groups = [TaskStatus.TODO, TaskStatus.DOING, TaskStatus.COMPLETED];
  return groups.map((status) => ({
    title: project,
    status,
    priority:
      project === 'Design Homepage'
        ? Priority.HIGH
        : project === 'Develop Login Feature'
          ? Priority.LOW
          : Priority.MEDIUM,
    labels: [],
    assignee:
      project === 'Design Homepage'
        ? 'admin@demo.local'
        : project === 'Develop Login Feature'
          ? 'casey@demo.local'
          : undefined,
    dueDate:
      project === 'Design Homepage'
        ? '2026-09-12'
        : project === 'Develop Login Feature'
          ? '2026-09-15'
          : '2026-09-18',
    project,
    activities: ['created this task'],
  }));
}
