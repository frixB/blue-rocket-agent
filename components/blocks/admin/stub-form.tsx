"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Note } from "@/components/ui";

/**
 * A settings-style form whose save isn't wired yet. Fields are ordinary
 * uncontrolled inputs passed as children, so the server renders them with
 * their current values. Save says plainly what would happen and takes focus,
 * so the result is read out; editing again clears it.
 */
export function StubForm({ submit, done, children, className }: {
  submit: string;
  /** What happens once the admin API is connected, in one sentence. */
  done: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);
  const result = useRef<HTMLDivElement>(null);
  useEffect(() => { if (saved) result.current?.focus(); }, [saved]);
  return (
    <form className={className ?? "flex flex-col gap-5"} onChange={() => setSaved(false)}
      onSubmit={(e) => { e.preventDefault(); if (e.currentTarget.reportValidity()) setSaved(true); }}>
      {children}
      <div className="flex flex-col items-start gap-3">
        <Button type="submit" size="sm">{submit}</Button>
        {saved && (
          <div ref={result} tabIndex={-1} className="outline-none">
            <Note tone="info">Not saved: the admin API isn&apos;t connected yet. When it is, {done}</Note>
          </div>
        )}
      </div>
    </form>
  );
}
