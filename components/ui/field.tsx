import { CircleCheck, Clock, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon, type LucideIcon } from "./icon";

type MessageTone = "neutral" | "success" | "warning" | "danger";
const messageTone: Record<MessageTone, { cls: string; icon: LucideIcon }> = {
  neutral: { cls: "text-muted", icon: Clock },
  success: { cls: "text-success-ink", icon: CircleCheck },
  warning: { cls: "text-warning-ink", icon: TriangleAlert },
  danger: { cls: "text-danger-ink", icon: TriangleAlert },
};

type Props = {
  /** Must match the control's id. */
  htmlFor: string;
  label: string;
  hint?: string;
  required?: boolean;
  message?: { tone: MessageTone; text: React.ReactNode };
  className?: string;
  children: React.ReactNode;
};

/**
 * Figma "Field": label, hint, control, message. S-01 shows the four message
 * states (checking, verified, mismatch, unreachable). The message is linked
 * to the control through aria-describedby by the caller passing `${id}-msg`.
 */
export function Field({ htmlFor, label, hint, required, message, className, children }: Props) {
  const m = message && messageTone[message.tone];
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-1">
        <label htmlFor={htmlFor} className="type-bra-label text-ink">
          {label}
          {required && <span aria-hidden className="text-danger-accent"> *</span>}
        </label>
        {hint && <p id={`${htmlFor}-hint`} className="type-caption text-muted">{hint}</p>}
      </div>
      {children}
      {message && m && (
        <p id={`${htmlFor}-msg`} role={message.tone === "danger" ? "alert" : "status"} className={cn("flex items-start gap-2 type-caption-strong", m.cls)}>
          <Icon icon={m.icon} size="sm" className="mt-0.5" />
          <span>{message.text}</span>
        </p>
      )}
    </div>
  );
}
