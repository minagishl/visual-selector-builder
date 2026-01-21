import { useMemo } from 'preact/hooks';
import { TreeNode } from './TreeNode';
import type { DOMTreeNode } from '../../types';

interface DOMTreeViewProps {
  tree: DOMTreeNode;
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  highlightedNodeIds: Set<string>;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
  onToggleExpand: (id: string) => void;
}

interface LayoutNode {
  node: DOMTreeNode;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 60;

function calculateLayout(
  node: DOMTreeNode,
  expandedNodes: Set<string>,
  x: number = 100,
  y: number = 100,
  parentX?: number,
  parentY?: number
): { layouts: LayoutNode[]; width: number; height: number } {
  const layouts: LayoutNode[] = [];
  const isExpanded = expandedNodes.has(node.id);

  layouts.push({ node, x, y, parentX, parentY });

  if (!isExpanded || node.children.length === 0) {
    return { layouts, width: NODE_WIDTH, height: NODE_HEIGHT };
  }

  let childX = x;
  let maxChildHeight = 0;
  const childLayouts: LayoutNode[] = [];

  for (const child of node.children) {
    const childResult = calculateLayout(
      child,
      expandedNodes,
      childX,
      y + NODE_HEIGHT + VERTICAL_GAP,
      x + NODE_WIDTH / 2,
      y + NODE_HEIGHT
    );

    childLayouts.push(...childResult.layouts);
    childX += childResult.width + HORIZONTAL_GAP;
    maxChildHeight = Math.max(maxChildHeight, childResult.height);
  }

  const totalWidth = Math.max(NODE_WIDTH, childX - x - HORIZONTAL_GAP);
  const centerOffset = (totalWidth - NODE_WIDTH) / 2;
  layouts[0].x = x + centerOffset;

  for (const layout of childLayouts) {
    if (layout.parentY === y + NODE_HEIGHT) {
      layout.parentX = x + centerOffset + NODE_WIDTH / 2;
    }
  }

  layouts.push(...childLayouts);

  return {
    layouts,
    width: totalWidth,
    height: NODE_HEIGHT + VERTICAL_GAP + maxChildHeight,
  };
}

export function DOMTreeView({
  tree,
  expandedNodes,
  selectedNodeId,
  hoveredNodeId,
  highlightedNodeIds,
  onSelectNode,
  onHoverNode,
  onToggleExpand,
}: DOMTreeViewProps) {
  const { layouts, width, height } = useMemo(
    () => calculateLayout(tree, expandedNodes),
    [tree, expandedNodes]
  );

  const connectors = useMemo(() => {
    return layouts
      .filter(
        (layout) => layout.parentX !== undefined && layout.parentY !== undefined
      )
      .map((layout, i) => {
        const startX = layout.parentX!;
        const startY = layout.parentY!;
        const endX = layout.x + NODE_WIDTH / 2;
        const endY = layout.y;
        const midY = startY + (endY - startY) / 2;

        return (
          <path
            key={i}
            d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
            class="stroke-mono-600 stroke-2 fill-none"
          />
        );
      });
  }, [layouts]);

  return (
    <div
      style={{
        width: `${width + 200}px`,
        height: `${height + 200}px`,
        position: 'relative',
      }}
    >
      <svg
        class="absolute top-0 left-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        {connectors}
      </svg>

      {layouts.map((layout) => (
        <div
          key={layout.node.id}
          class="absolute"
          style={{
            left: `${layout.x}px`,
            top: `${layout.y}px`,
            width: `${NODE_WIDTH}px`,
          }}
        >
          <TreeNode
            node={layout.node}
            isSelected={selectedNodeId === layout.node.id}
            isHovered={hoveredNodeId === layout.node.id}
            isHighlighted={highlightedNodeIds.has(layout.node.id)}
            isExpanded={expandedNodes.has(layout.node.id)}
            onSelect={onSelectNode}
            onHover={onHoverNode}
            onToggleExpand={onToggleExpand}
          />
        </div>
      ))}
    </div>
  );
}
