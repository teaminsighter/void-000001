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
  const baseStyles = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 6,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.15s",
    fontFamily: "inherit",
    border: "none",
  };

  const sizeStyles = {
    sm: { padding: "6px 12px", fontSize: 11 },
    md: { padding: "8px 16px", fontSize: 12 },
  };

  const variantStyles = {
    primary: {
      background: "#f59e0b",
      color: "#0c0d10",
      border: "none",
    },
    secondary: {
      background: "#111218",
      color: "#71717a",
      border: "1px solid #1a1b20",
    },
    ghost: {
      background: "transparent",
      color: "#71717a",
      border: "1px solid transparent",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "primary") {
          e.currentTarget.style.background = "#d97706";
        } else if (variant === "secondary") {
          e.currentTarget.style.background = "#1a1b20";
        } else {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = variantStyles[variant].background;
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
