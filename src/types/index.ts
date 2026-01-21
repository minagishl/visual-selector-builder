// DOM Tree Types
export interface DOMTreeNode {
  id: string;
  tagName: string;
  attributes: Record<string, string>;
  textContent: string | null;
  children: DOMTreeNode[];
  parent: string | null;
  depth: number;
  index: number; // Index among siblings
}

// Selector Types
export type SelectorType = 'css' | 'xpath';

export interface SelectorPart {
  type: 'tag' | 'id' | 'class' | 'attribute' | 'nth-child' | 'combinator';
  value: string;
  optional?: boolean;
}

export interface GeneratedSelector {
  type: SelectorType;
  selector: string;
  parts: SelectorPart[];
  specificity: number;
  matchCount?: number;
}

// Canvas Types
export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasViewport {
  width: number;
  height: number;
}

// Tree Layout Types
export interface TreeNodeLayout {
  node: DOMTreeNode;
  x: number;
  y: number;
  width: number;
  height: number;
  expanded: boolean;
}

// App State Types
export type SourceType = 'url' | 'paste';

export interface SourceInput {
  type: SourceType;
  value: string;
}

export interface AppState {
  // Source
  source: SourceInput | null;
  htmlContent: string | null;
  loading: boolean;
  error: string | null;

  // DOM Tree
  domTree: DOMTreeNode | null;
  expandedNodes: Set<string>;

  // Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  highlightedNodeIds: Set<string>;

  // Selectors
  generatedSelectors: GeneratedSelector[];
  customSelector: string;
  customSelectorType: SelectorType;
  testResults: TestResult | null;

  // Canvas
  transform: CanvasTransform;
}

export interface TestResult {
  selector: string;
  type: SelectorType;
  matchCount: number;
  matchedNodeIds: string[];
  error?: string;
}

// Action Types
export type AppAction =
  | { type: 'SET_SOURCE'; payload: SourceInput }
  | { type: 'SET_HTML_CONTENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DOM_TREE'; payload: DOMTreeNode | null }
  | { type: 'TOGGLE_NODE_EXPANDED'; payload: string }
  | { type: 'EXPAND_ALL_NODES' }
  | { type: 'COLLAPSE_ALL_NODES' }
  | { type: 'SELECT_NODE'; payload: string | null }
  | { type: 'HOVER_NODE'; payload: string | null }
  | { type: 'SET_HIGHLIGHTED_NODES'; payload: Set<string> }
  | { type: 'SET_GENERATED_SELECTORS'; payload: GeneratedSelector[] }
  | { type: 'SET_CUSTOM_SELECTOR'; payload: string }
  | { type: 'SET_CUSTOM_SELECTOR_TYPE'; payload: SelectorType }
  | { type: 'SET_TEST_RESULTS'; payload: TestResult | null }
  | { type: 'SET_TRANSFORM'; payload: CanvasTransform }
  | { type: 'RESET_TRANSFORM' }
  | { type: 'RESET_STATE' };

// Component Props
export interface PixelButtonProps {
  children: preact.ComponentChildren;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
}

export interface PixelPanelProps {
  children: preact.ComponentChildren;
  title?: string;
  className?: string;
  notched?: boolean;
}

export interface PixelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'url';
  disabled?: boolean;
}

export interface TreeNodeProps {
  node: DOMTreeNode;
  layout: TreeNodeLayout;
  isSelected: boolean;
  isHovered: boolean;
  isHighlighted: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onToggleExpand: (id: string) => void;
}
