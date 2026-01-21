import type { DOMTreeNode, SelectorType, TestResult } from '../../types';

function createDocumentFromTree(tree: DOMTreeNode): Document {
  const parser = new DOMParser();
  const html = serializeTreeToHTML(tree);
  return parser.parseFromString(html, 'text/html');
}

function serializeTreeToHTML(node: DOMTreeNode): string {
  const attrs = Object.entries(node.attributes)
    .map(([key, value]) => `${key}="${value.replace(/"/g, '&quot;')}"`)
    .join(' ');

  const openTag = attrs ? `<${node.tagName} ${attrs}>` : `<${node.tagName}>`;
  const closeTag = `</${node.tagName}>`;

  const childrenHTML = node.children.map(serializeTreeToHTML).join('');
  const textContent = node.textContent || '';

  return `${openTag}${textContent}${childrenHTML}${closeTag}`;
}

function buildNodeIdMap(
  tree: DOMTreeNode,
  doc: Document
): Map<Element, string> {
  const map = new Map<Element, string>();

  function traverse(node: DOMTreeNode, elements: HTMLCollection, index: number) {
    const element = elements[index];
    if (!element) return;

    map.set(element, node.id);

    let childIndex = 0;
    for (const child of node.children) {
      traverse(child, element.children, childIndex);
      childIndex++;
    }
  }

  // Find the root element in the document
  const root = doc.body.firstElementChild || doc.body;
  map.set(root, tree.id);

  let childIndex = 0;
  for (const child of tree.children) {
    traverse(child, root.children, childIndex);
    childIndex++;
  }

  return map;
}

export function testSelector(
  selector: string,
  type: SelectorType,
  tree: DOMTreeNode
): TestResult {
  try {
    const doc = createDocumentFromTree(tree);
    const nodeIdMap = buildNodeIdMap(tree, doc);

    let matchedElements: Element[] = [];

    if (type === 'css') {
      matchedElements = Array.from(doc.querySelectorAll(selector));
    } else if (type === 'xpath') {
      const result = doc.evaluate(
        selector,
        doc,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      for (let i = 0; i < result.snapshotLength; i++) {
        const node = result.snapshotItem(i);
        if (node instanceof Element) {
          matchedElements.push(node);
        }
      }
    }

    const matchedNodeIds = matchedElements
      .map((el) => nodeIdMap.get(el))
      .filter((id): id is string => id !== undefined);

    return {
      selector,
      type,
      matchCount: matchedNodeIds.length,
      matchedNodeIds,
    };
  } catch (error) {
    return {
      selector,
      type,
      matchCount: 0,
      matchedNodeIds: [],
      error: error instanceof Error ? error.message : 'Invalid selector',
    };
  }
}

export function validateSelector(
  selector: string,
  type: SelectorType
): { valid: boolean; error?: string } {
  try {
    if (type === 'css') {
      document.querySelector(selector);
    } else if (type === 'xpath') {
      document.evaluate(selector, document, null, XPathResult.ANY_TYPE, null);
    }
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid selector',
    };
  }
}
