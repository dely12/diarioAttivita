import * as React from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "md" | "sm";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-semibold transition " +
    "focus:outline-none focus:ring-4 disabled:opacity-60";

  const sizes: Record<Size, string> = {
    md: "h-11 px-4 text-sm",
    sm: "h-9 px-3 text-sm", // perfetto per header/actions
  };

  const variants: Record<Variant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-100",
    secondary:   "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-100",
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />
  );
}
