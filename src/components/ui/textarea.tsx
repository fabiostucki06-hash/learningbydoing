import { useId, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function Textarea({ label, hint, className = "", ...props }: Props) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className={`min-h-24 resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-base outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/30 ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
