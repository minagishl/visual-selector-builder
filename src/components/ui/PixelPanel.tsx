import type { PixelPanelProps } from '../../types';

export function PixelPanel({
  children,
  title,
  className = '',
}: PixelPanelProps) {
  return (
    <div class={`bg-mono-900 border border-mono-700 ${className}`}>
      {title && (
        <div class="px-3 py-2 border-b border-mono-700 bg-mono-800">
          <h3 class="text-xs font-medium text-mono-300 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div class={title ? 'p-3' : ''}>{children}</div>
    </div>
  );
}
