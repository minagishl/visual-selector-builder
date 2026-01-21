interface StatusBarProps {
  selectedNode?: string | null;
  nodeCount?: number;
  matchCount?: number;
}

export function StatusBar({
  selectedNode,
  nodeCount = 0,
  matchCount,
}: StatusBarProps) {
  return (
    <footer class="h-8 bg-mono-900 border-t border-mono-700 flex items-center px-4 text-xs">
      <div class="flex items-center gap-6 text-mono-400">
        <span>
          Nodes: <span class="text-mono-100">{nodeCount}</span>
        </span>

        {selectedNode && (
          <span>
            Selected: <span class="text-mono-100">{selectedNode}</span>
          </span>
        )}

        {matchCount !== undefined && (
          <span>
            Matches: <span class="text-mono-100">{matchCount}</span>
          </span>
        )}
      </div>

      <div class="flex-1" />

      <div class="text-mono-500">
        <kbd class="px-1 bg-mono-800 border border-mono-700">Ctrl+C</kbd> Copy
        selector
        <span class="mx-2">|</span>
        <kbd class="px-1 bg-mono-800 border border-mono-700">Esc</kbd> Deselect
      </div>
    </footer>
  );
}
