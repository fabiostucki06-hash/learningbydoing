import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-sm hover:bg-brand-hover",
  secondary: "border border-border bg-surface text-foreground shadow-sm hover:bg-surface-hover",
  ghost: "text-muted hover:bg-surface-hover hover:text-foreground",
};

/** Klassen des Buttons, auch für Links im Button-Look (Next <Link>). */
export function buttonStyles(variant: Variant = "primary", className = "") {
  return `pressable inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: Props) {
  return <button type={type} className={buttonStyles(variant, className)} {...props} />;
}
