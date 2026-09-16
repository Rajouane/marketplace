function Button({
  children,
  type = "button",
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}) {
  const variants = {
    primary:
      "bg-[#0b1736] text-white hover:bg-[#142653]",

    secondary:
      "bg-slate-100 text-slate-700 hover:bg-slate-200",

    success:
      "bg-emerald-600 text-white hover:bg-emerald-700",

    danger:
      "bg-red-600 text-white hover:bg-red-700",

    warning:
      "bg-amber-500 text-white hover:bg-amber-600",

    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-lg px-4 py-2.5",
        "text-sm font-medium",
        "transition duration-200",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        variants[variant] || variants.primary,
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default Button;