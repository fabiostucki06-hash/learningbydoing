import { useId, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, className = "", ...props }: Props) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={`h-11 rounded-lg border border-border bg-surface px-3 text-base outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/30 ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
