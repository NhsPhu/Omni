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
    gold:   "bg-[var(--gold)] text-white hover:bg-[#B45309] focus:ring-[var(--gold)] shadow-[0_8px_24px_rgba(202,138,4,0.3)] hover:shadow-[0_12px_32px_rgba(202,138,4,0.4)] active:scale-[0.98] border border-transparent",
    purple: "bg-[#1C1917] text-white hover:bg-[#0C0A09] focus:ring-[#1C1917] shadow-[0_8px_24px_rgba(28,25,23,0.3)] hover:shadow-[0_12px_32px_rgba(28,25,23,0.4)] active:scale-[0.98] border border-transparent",
    glass:  "bg-white/70 backdrop-blur-xl text-gray-900 hover:bg-white/90 border border-black/5 focus:ring-[#1C1917] active:scale-[0.98] shadow-sm",
    ghost:  "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-black/5 focus:ring-[#1C1917]",
  };

  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
