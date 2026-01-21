import type { ComponentChildren } from 'preact';

interface HeaderProps {
  children?: ComponentChildren;
}

export function Header({ children }: HeaderProps) {
  return (
    <header class="h-14 bg-mono-900 border-b border-mono-700 flex items-center px-4 gap-4">
      <h1 class="text-base font-bold tracking-wide font-mono">
        <span class="text-mono-100">SELECTOR</span>
        <span class="text-mono-400">BUILDER</span>
      </h1>

      <div class="flex-1 flex items-center gap-4">{children}</div>
    </header>
  );
}
