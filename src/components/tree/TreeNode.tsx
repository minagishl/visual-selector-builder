import { ChevronRight, ChevronDown } from 'lucide-preact';
import type { DOMTreeNode } from '../../types';

interface TreeNodeProps {
  node: DOMTreeNode;
  isSelected: boolean;
  isHovered: boolean;
  isHighlighted: boolean;
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onToggleExpand: (id: string) => void;
}

export function TreeNode({
  node,
  isSelected,
  isHovered,
  isHighlighted,
  isExpanded,
  onSelect,
  onHover,
  onToggleExpand,
}: TreeNodeProps) {
  const hasChildren = node.children.length > 0;

  const getBgColor = () => {
    if (isSelected) return 'bg-mono-100 text-mono-900';
    if (isHighlighted) return 'bg-mono-700 text-mono-100';
    if (isHovered) return 'bg-mono-800 text-mono-100';
    return 'bg-mono-900 text-mono-100';
  };

  const getBorderColor = () => {
    if (isSelected) return 'border-mono-100';
    if (isHighlighted) return 'border-mono-400';
    if (isHovered) return 'border-mono-500';
    return 'border-mono-700';
  };

  const displayText = node.textContent
    ? node.textContent.length > 20
      ? node.textContent.slice(0, 20) + '...'
      : node.textContent
    : null;

  const displayAttrs: string[] = [];
  if (node.attributes.id) displayAttrs.push(`#${node.attributes.id}`);
  if (node.attributes.class) {
    const classes = node.attributes.class.split(/\s+/).slice(0, 2);
    displayAttrs.push(...classes.map((c) => `.${c}`));
  }

  return (
    <div
      class={`border cursor-pointer transition-colors select-none ${getBgColor()} ${getBorderColor()}`}
      style={{ minWidth: '120px', maxWidth: '240px' }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div class="flex items-center gap-2 px-2 py-1">
        {hasChildren && (
          <button
            type="button"
            class="p-0.5 hover:bg-mono-700"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown
                size={12}
                class={isSelected ? 'text-mono-600' : 'text-mono-400'}
              />
            ) : (
              <ChevronRight
                size={12}
                class={isSelected ? 'text-mono-600' : 'text-mono-400'}
              />
            )}
          </button>
        )}

        {!hasChildren && <div class="w-4" />}

        <span
          class={`font-medium text-sm ${isSelected ? 'text-mono-900' : 'text-mono-100'}`}
        >
          &lt;{node.tagName}&gt;
        </span>
      </div>

      {displayAttrs.length > 0 && (
        <div class="px-2 pb-1 flex flex-wrap gap-1">
          {displayAttrs.map((attr, i) => (
            <span
              key={i}
              class={`text-xs px-1 ${
                isSelected
                  ? 'bg-mono-300 text-mono-800'
                  : 'bg-mono-800 text-mono-300'
              }`}
            >
              {attr}
            </span>
          ))}
        </div>
      )}

      {displayText && (
        <div
          class={`px-2 pb-1 text-xs italic truncate ${
            isSelected ? 'text-mono-600' : 'text-mono-500'
          }`}
        >
          "{displayText}"
        </div>
      )}
    </div>
  );
}
