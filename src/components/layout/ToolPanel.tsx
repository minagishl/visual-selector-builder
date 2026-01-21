import type { ComponentChildren } from 'preact';

interface ToolPanelProps {
  children: ComponentChildren;
  position?: 'left' | 'right';
  width?: number;
}

export function ToolPanel({
  children,
  position = 'right',
  width = 320,
}: ToolPanelProps) {
  return (
    <aside
      class={`h-full bg-mono-900 overflow-y-auto ${
        position === 'left' ? 'border-r border-mono-700' : 'border-l border-mono-700'
      }`}
      style={{ width: `${width}px`, minWidth: `${width}px` }}
    >
      <div class="p-3 flex flex-col gap-3">{children}</div>
    </aside>
  );
}
