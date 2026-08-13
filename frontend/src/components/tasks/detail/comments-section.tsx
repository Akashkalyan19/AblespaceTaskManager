"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Ellipsis, Paperclip, SendHorizontal, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/format";
import { useAddComment, useComments, useMe } from "@/lib/queries";

/**
 * Comments under the subtasks table. (The mock labels this section
 * "Subtasks" by mistake — it clearly shows comments, so it is titled
 * "Comments" here; noted in the README.)
 */
export function CommentsSection({ taskId }: { taskId: string }) {
  const { data: comments, isPending } = useComments(taskId);
  const { data: me } = useMe();
  const addComment = useAddComment(taskId);
  const [reply, setReply] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const body = reply.trim();
    if (!body) return;
    addComment.mutate(body, {
      onSuccess: () => setReply(""),
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <section className="mt-8" aria-label="Comments">
      <h2 className="mb-3 text-sm font-semibold">Comments</h2>

      {isPending ? (
        <Skeleton className="h-28 w-full rounded-lg" />
      ) : (
        <div className="rounded-lg border">
          {(comments ?? []).map((comment) => (
            <article key={comment.id} className="border-b px-4 py-3 last:border-b-0">
              <header className="flex items-center gap-2">
                {comment.author ? (
                  <UserAvatar user={comment.author} size={24} />
                ) : null}
                <span className="text-sm font-semibold">
                  {comment.author?.name ?? "Unknown"}
                </span>
                <time
                  dateTime={comment.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {timeAgo(comment.createdAt)}
                </time>
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="React with emoji"
                    onClick={() => toast.info("Reactions are not part of this demo.")}
                  >
                    <SmilePlus aria-hidden />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Comment options"
                    onClick={() => toast.info("Comment options are not part of this demo.")}
                  >
                    <Ellipsis aria-hidden />
                  </Button>
                </span>
              </header>
              <p className="mt-1.5 whitespace-pre-wrap text-[15px]">{comment.body}</p>
            </article>
          ))}

          <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3">
            {me ? <UserAvatar user={me} size={24} /> : null}
            <input
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder={
                (comments ?? []).length > 0 ? "Leave a reply…" : "Add a comment…"
              }
              aria-label="Write a comment"
              maxLength={2000}
              className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Attach file"
              className="text-muted-foreground"
              onClick={() => toast.info("Attachments are not part of this demo.")}
            >
              <Paperclip aria-hidden />
            </Button>
            <Button
              type="submit"
              variant="ghost"
              size="icon-sm"
              aria-label="Send comment"
              disabled={!reply.trim() || addComment.isPending}
            >
              <SendHorizontal aria-hidden />
            </Button>
          </form>
        </div>
      )}
    </section>
  );
}
