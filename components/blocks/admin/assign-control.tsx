"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import { Button, Chip, Icon } from "@/components/ui";

/**
 * Who has this exception. Take an unassigned one, drop your own, or see who
 * else has it. Changes show straight away; until the admin API is connected
 * they aren't saved, and the caption says so.
 */
export function AssignControl({ assignee: initial, me, subject }: { assignee?: string; me: string; subject: string }) {
  const [assignee, setAssignee] = useState(initial);
  const changed = assignee !== initial;
  const mine = assignee === me;
  return (
    <span className="flex flex-col items-start gap-1 sm:items-end">
      {assignee && !mine ? (
        <Chip icon={UserRound}>{assignee} has it</Chip>
      ) : mine ? (
        <span className="flex items-center gap-2">
          <Chip tone="info" icon={UserRound}>You have it</Chip>
          <Button variant="text" size="sm" aria-label={`Unassign yourself from ${subject}`} onClick={() => setAssignee(undefined)}>Unassign</Button>
        </span>
      ) : (
        <Button variant="ghost" size="sm" aria-label={`Assign ${subject} to me`} onClick={() => setAssignee(me)}>
          <Icon icon={UserRound} size="sm" /> Assign to me
        </Button>
      )}
      <span aria-live="polite" className="type-caption text-muted">{changed ? "Not saved: the admin API isn't connected yet." : ""}</span>
    </span>
  );
}
