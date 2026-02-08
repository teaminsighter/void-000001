"use client";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  icon,
}: ButtonProps) {
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs";

  const variantClasses = {
    primary: "bg-void-accent text-void-bg hover:brightness-90 border-transparent",
    secondary: "bg-void-surface text-void-muted border-void-border hover:bg-[rgba(128,128,128,0.1)]",
    ghost: "bg-transparent text-void-muted border-transparent hover:bg-[rgba(128,128,128,0.05)]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 rounded-md font-semibold
        border transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
