"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api";
import type {
  Activity,
  AuthResponse,
  Comment,
  CreateProjectInput,
  CreateTaskInput,
  Project,
  Task,
  UpdateProfileInput,
  UpdateProjectInput,
  UpdateTaskInput,
  User,
} from "./types";

/**
 * All server state goes through TanStack Query so components get caching,
 * loading/error states and cache invalidation for free.
 */

export interface TaskFilters {
  projectId?: string;
  search?: string;
}

function taskQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.projectId) params.set("projectId", filters.projectId);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ---- Users -------------------------------------------------------------------

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<User>("/users/me"),
    staleTime: 60_000,
  });
}

export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: () => api<User[]>("/users/members"),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      api<User>("/users/me", { method: "PATCH", body: input }),
    onSuccess: (user) => queryClient.setQueryData(["me"], user),
  });
}

export function useGuestLogin() {
  return useMutation({
    mutationFn: (name?: string) =>
      api<AuthResponse>("/auth/guest", { method: "POST", body: { name } }),
  });
}

export function useLeaveWorkspace() {
  return useMutation({
    mutationFn: () => api<void>("/users/me", { method: "DELETE" }),
  });
}

// ---- Tasks -------------------------------------------------------------------

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => api<Task[]>(`/tasks${taskQueryString(filters)}`),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", "detail", id],
    queryFn: () => api<Task>(`/tasks/${id}`),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      api<Task>("/tasks", { method: "POST", body: input }),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (task.parentId) {
        void queryClient.invalidateQueries({
          queryKey: ["tasks", "detail", task.parentId],
        });
      }
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      api<Task>(`/tasks/${id}`, { method: "PATCH", body: input }),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      void queryClient.invalidateQueries({
        queryKey: ["activity", task.id],
      });
      if (task.parentId) {
        void queryClient.invalidateQueries({
          queryKey: ["tasks", "detail", task.parentId],
        });
      }
    },
  });
}

/** Optimistic status change used by board drag & drop so cards move instantly. */
export function useMoveTask(filters: TaskFilters = {}) {
  const queryClient = useQueryClient();
  const listKey = ["tasks", filters] as const;

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Task["status"] }) =>
      api<Task>(`/tasks/${id}`, { method: "PATCH", body: { status } }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<Task[]>(listKey);
      queryClient.setQueryData<Task[]>(listKey, (tasks) =>
        tasks?.map((t) => (t.id === id ? { ...t, status } : t)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ---- Comments & activity -------------------------------------------------------

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => api<Comment[]>(`/tasks/${taskId}/comments`),
  });
}

export function useAddComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      api<Comment>(`/tasks/${taskId}/comments`, {
        method: "POST",
        body: { body },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      void queryClient.invalidateQueries({ queryKey: ["activity", taskId] });
    },
  });
}

export function useActivity(taskId: string) {
  return useQuery({
    queryKey: ["activity", taskId],
    queryFn: () => api<Activity[]>(`/tasks/${taskId}/activity`),
  });
}

// ---- Projects -------------------------------------------------------------------

export function useProjects(search?: string) {
  return useQuery({
    queryKey: ["projects", { search: search ?? "" }],
    queryFn: () =>
      api<Project[]>(`/projects${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", "detail", id],
    queryFn: () => api<Project>(`/projects/${id}`),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) =>
      api<Project>("/projects", { method: "POST", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      api<Project>(`/projects/${id}`, { method: "PATCH", body: input }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
