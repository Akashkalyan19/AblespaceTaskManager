"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useLeaveWorkspace, useMe, useUpdateProfile } from "@/lib/queries";
import { clearToken } from "@/lib/auth";
import type { UpdateProfileInput } from "@/lib/types";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { data: me, isPending } = useMe();
  const updateProfile = useUpdateProfile();
  const leaveWorkspace = useLeaveWorkspace();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    if (me) {
      setName(me.name);
      setEmail(me.email ?? "");
      setTitle(me.title ?? "");
      setUsername(me.username ?? "");
    }
  }, [me]);

  /** Fields save on blur (the design has no explicit save button). */
  function save(field: keyof UpdateProfileInput, value: string) {
    if (!me) return;
    const current =
      field === "name" ? me.name : field === "email" ? me.email : field === "title" ? me.title : me.username;
    const next = value.trim();
    if (next === (current ?? "")) return;
    if (field === "name" && next.length === 0) {
      setName(me.name);
      toast.error("Name cannot be empty.");
      return;
    }
    if (field === "email" && next.length === 0) {
      setEmail(me.email ?? "");
      return;
    }

    updateProfile.mutate(
      { [field]: next },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (error) => {
          toast.error(error.message);
          // restore last saved value
          if (field === "name") setName(me.name);
          if (field === "email") setEmail(me.email ?? "");
          if (field === "title") setTitle(me.title ?? "");
          if (field === "username") setUsername(me.username ?? "");
        },
      },
    );
  }

  if (isPending || !me) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  const row = "flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between";
  const inputClass = "w-full bg-muted/60 sm:w-48";

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Profile</h1>

      <section className="divide-y rounded-xl border">
        <div className={row}>
          <span className="text-sm font-medium">Profile picture</span>
          <UserAvatar user={me} size={32} />
        </div>

        <div className={row}>
          <label htmlFor="profile-email" className="text-sm font-medium">
            Email
          </label>
          <span className="flex items-center gap-2">
            {editingEmail ? (
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => {
                  setEditingEmail(false);
                  save("email", email);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                className={inputClass}
                autoFocus
              />
            ) : (
              <>
                <span className="text-sm">{me.email ?? "No email (guest)"}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit email"
                  onClick={() => setEditingEmail(true)}
                >
                  <Pencil aria-hidden />
                </Button>
              </>
            )}
          </span>
        </div>

        <div className={row}>
          <label htmlFor="profile-name" className="text-sm font-medium">
            Full name
          </label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={() => save("name", name)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            className={inputClass}
          />
        </div>

        <div className={row}>
          <span>
            <label htmlFor="profile-title" className="block text-sm font-medium">
              Title
            </label>
            <span className="text-xs text-muted-foreground">Your job title or role</span>
          </span>
          <Input
            id="profile-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => save("title", title)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            className={inputClass}
          />
        </div>

        <div className={row}>
          <span>
            <label htmlFor="profile-username" className="block text-sm font-medium">
              Username
            </label>
            <span className="text-xs text-muted-foreground">
              One word, like a nickname or first name
            </span>
          </span>
          <Input
            id="profile-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            onBlur={() => save("username", username)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            className={inputClass}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Workspace access</h2>
        <div className="flex flex-col gap-3 rounded-xl border bg-overdue-bg/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Remove yourself from the workspace
          </p>
          <Button
            variant="destructive-soft"
            onClick={() => setConfirmLeave(true)}
            className="shrink-0"
          >
            Leave Workspace
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title="Leave workspace?"
        description="Your guest account and all of its data (projects, tasks, comments) will be permanently deleted."
        confirmLabel="Leave Workspace"
        pending={leaveWorkspace.isPending}
        onConfirm={() =>
          leaveWorkspace.mutate(undefined, {
            onSuccess: () => {
              clearToken();
              router.replace("/login");
            },
            onError: (error) => toast.error(error.message),
          })
        }
      />
    </div>
  );
}
