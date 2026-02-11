import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm" | "icon";


export function Button({
  variant = "primary",
  size = "md",
  className = "",
  leftIcon,
  rightIcon,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode
rightIcon?: React.ReactNode
children?: React.ReactNode;
}) {
 
const base = "gf-btn";



const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
  icon: "h-9 w-9 p-0",
};


const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-100",
  secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-200",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-200",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-100",
};


  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children != null && <span className="truncate">{children}</span>}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
