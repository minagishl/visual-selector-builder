import type { PixelInputProps } from '../../types';

export function PixelInput({
  value,
  onChange,
  placeholder,
  className = '',
  type = 'text',
  disabled = false,
}: PixelInputProps) {
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <input
      type={type}
      value={value}
      onInput={(e) => onChange((e.target as HTMLInputElement).value)}
      placeholder={placeholder}
      disabled={disabled}
      class={`w-full bg-mono-950 border border-mono-700 px-3 py-2 text-mono-100 font-mono text-sm outline-none focus:border-mono-400 placeholder:text-mono-600 ${disabledClasses} ${className}`}
    />
  );
}
