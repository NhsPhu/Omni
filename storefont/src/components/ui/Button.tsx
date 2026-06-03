"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "purple" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({ variant = "gold", size = "md", loading = false, children, className, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl cursor-pointer transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg-base disabled:opacity-40 disabled:cursor-not-allowed font-[family-name:var(--font-body)] tracking-wide";

  const variants = {
    gold:   "bg-gold text-bg-base hover:bg-gold-light focus:ring-gold shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.5)] active:scale-[0.97]",
    purple: "bg-purple text-white hover:bg-purple-light focus:ring-purple shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_30px_rgba(139,92,246,0.5)] active:scale-[0.97]",
    glass:  "glass text-text-primary hover:bg-glass-hover border-border focus:ring-purple active:scale-[0.97]",
    ghost:  "bg-transparent text-text-secondary hover:text-text-primary hover:bg-glass focus:ring-purple",
  };

  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
