import type { DOMTreeNode } from '../../types';

let nodeIdCounter = 0;

function generateNodeId(): string {
  return `node-${++nodeIdCounter}`;
}

export function resetNodeIdCounter(): void {
  nodeIdCounter = 0;
}

function getTextContent(element: Element): string | null {
  // Get direct text content (not from children)
  let text = '';
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent?.trim() || '';
    }
  }
  return text || null;
}

function getAttributes(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const attr of element.attributes) {
    attrs[attr.name] = attr.value;
  }
  return attrs;
}

function parseElement(
  element: Element,
  parentId: string | null,
  depth: number,
  index: number
): DOMTreeNode {
  const id = generateNodeId();
  const tagName = element.tagName.toLowerCase();
  const attributes = getAttributes(element);
  const textContent = getTextContent(element);

  const children: DOMTreeNode[] = [];
  let childIndex = 0;

  for (const child of element.children) {
    children.push(parseElement(child, id, depth + 1, childIndex));
    childIndex++;
  }

  return {
    id,
    tagName,
    attributes,
    textContent,
    children,
    parent: parentId,
    depth,
    index,
  };
}

export function parseHTML(html: string): DOMTreeNode | null {
  resetNodeIdCounter();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Find the body or the first meaningful element
  const body = doc.body;
  if (!body || body.children.length === 0) {
    // Try parsing as fragment
    const fragment = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const wrapper = fragment.body.firstElementChild;
    if (wrapper && wrapper.children.length > 0) {
      // If there's only one child, return it directly
      if (wrapper.children.length === 1) {
        return parseElement(wrapper.children[0], null, 0, 0);
      }
      // Otherwise, create a virtual root
      return parseElement(wrapper, null, 0, 0);
    }
    return null;
  }

  // If body has only one child, return it
  if (body.children.length === 1) {
    return parseElement(body.children[0], null, 0, 0);
  }

  // Return body itself if multiple children
  return parseElement(body, null, 0, 0);
}

export function findNodeById(
  tree: DOMTreeNode | null,
  id: string
): DOMTreeNode | null {
  if (!tree) return null;
  if (tree.id === id) return tree;

  for (const child of tree.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }

  return null;
}

export function getNodePath(
  tree: DOMTreeNode | null,
  targetId: string
): DOMTreeNode[] {
  if (!tree) return [];

  const path: DOMTreeNode[] = [];

  function findPath(node: DOMTreeNode): boolean {
    path.push(node);

    if (node.id === targetId) {
      return true;
    }

    for (const child of node.children) {
      if (findPath(child)) {
        return true;
      }
    }

    path.pop();
    return false;
  }

  findPath(tree);
  return path;
}

export function countNodes(tree: DOMTreeNode | null): number {
  if (!tree) return 0;
  let count = 1;
  for (const child of tree.children) {
    count += countNodes(child);
  }
  return count;
}

export function getAllNodeIds(tree: DOMTreeNode | null): Set<string> {
  const ids = new Set<string>();

  function collect(node: DOMTreeNode | null) {
    if (!node) return;
    ids.add(node.id);
    for (const child of node.children) {
      collect(child);
    }
  }

  collect(tree);
  return ids;
}

// CORS proxy fallback for fetching external URLs
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

export async function fetchHTML(url: string): Promise<string> {
  // Try direct fetch first
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
  } catch {
    // Direct fetch failed, try proxies
  }

  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url));
      if (response.ok) {
        return await response.text();
      }
    } catch {
      // Try next proxy
    }
  }

  throw new Error('Failed to fetch URL. The server may not allow cross-origin requests.');
}
