import type { PixelButtonProps } from '../../types';

export function PixelButton({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  title,
}: PixelButtonProps) {
  const baseClasses =
    'font-mono border transition-all duration-100 cursor-pointer active:translate-y-0.5';

  const variantClasses = {
    default:
      'bg-mono-800 text-mono-100 border-mono-600 hover:bg-mono-700 hover:border-mono-500',
    primary:
      'bg-mono-100 text-mono-900 border-mono-300 hover:bg-white hover:border-mono-400',
    success:
      'bg-mono-100 text-mono-900 border-mono-300 hover:bg-white hover:border-mono-400',
    danger:
      'bg-mono-800 text-mono-100 border-mono-500 hover:bg-mono-700 hover:text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      class={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}
