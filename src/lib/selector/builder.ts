import type { DOMTreeNode, GeneratedSelector, SelectorPart } from '../../types';
import { getNodePath } from '../dom/parser';

function escapeCSS(str: string): string {
  return str.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

function buildCSSSelector(node: DOMTreeNode, _tree: DOMTreeNode): GeneratedSelector {
  const parts: SelectorPart[] = [];
  let selector = '';
  let specificity = 0;

  // Try ID selector first (most specific)
  if (node.attributes.id) {
    const id = node.attributes.id;
    selector = `#${escapeCSS(id)}`;
    parts.push({ type: 'id', value: `#${id}` });
    specificity = 100;

    return { type: 'css', selector, parts, specificity };
  }

  // Build selector from tag + classes + attributes
  const tagPart = node.tagName;
  parts.push({ type: 'tag', value: tagPart });
  selector = tagPart;
  specificity = 1;

  // Add classes
  const classList = node.attributes.class?.split(/\s+/).filter(Boolean) || [];
  for (const cls of classList.slice(0, 3)) {
    const classPart = `.${escapeCSS(cls)}`;
    parts.push({ type: 'class', value: `.${cls}` });
    selector += classPart;
    specificity += 10;
  }

  // Add useful attributes
  const usefulAttrs = ['name', 'type', 'data-testid', 'data-id', 'role', 'aria-label'];
  for (const attr of usefulAttrs) {
    if (node.attributes[attr]) {
      const attrPart = `[${attr}="${escapeCSS(node.attributes[attr])}"]`;
      parts.push({ type: 'attribute', value: `[${attr}="${node.attributes[attr]}"]` });
      selector += attrPart;
      specificity += 10;
      break; // Only add one attribute
    }
  }

  return { type: 'css', selector, parts, specificity };
}

function buildHierarchicalCSSSelector(
  node: DOMTreeNode,
  tree: DOMTreeNode
): GeneratedSelector {
  const path = getNodePath(tree, node.id);
  const parts: SelectorPart[] = [];
  const selectorParts: string[] = [];
  let specificity = 0;

  for (let i = 0; i < path.length; i++) {
    const current = path[i];
    let part = current.tagName;

    parts.push({ type: 'tag', value: current.tagName });
    specificity += 1;

    // Add ID if available
    if (current.attributes.id) {
      part = `#${escapeCSS(current.attributes.id)}`;
      parts.push({ type: 'id', value: `#${current.attributes.id}` });
      specificity += 100;
      selectorParts.length = 0; // Reset - ID is unique enough
      selectorParts.push(part);
      continue;
    }

    // Add first class if available
    const classList = current.attributes.class?.split(/\s+/).filter(Boolean) || [];
    if (classList.length > 0) {
      part += `.${escapeCSS(classList[0])}`;
      parts.push({ type: 'class', value: `.${classList[0]}` });
      specificity += 10;
    }

    // Add nth-child for disambiguation if needed
    if (i === path.length - 1 && current.index > 0) {
      part += `:nth-child(${current.index + 1})`;
      parts.push({ type: 'nth-child', value: `:nth-child(${current.index + 1})` });
      specificity += 10;
    }

    selectorParts.push(part);

    // Add combinator
    if (i < path.length - 1) {
      parts.push({ type: 'combinator', value: ' > ' });
    }
  }

  return {
    type: 'css',
    selector: selectorParts.join(' > '),
    parts,
    specificity,
  };
}

function buildXPathSelector(node: DOMTreeNode, tree: DOMTreeNode): GeneratedSelector {
  const parts: SelectorPart[] = [];

  // Try ID first
  if (node.attributes.id) {
    const selector = `//*[@id="${node.attributes.id}"]`;
    parts.push({ type: 'attribute', value: `[@id="${node.attributes.id}"]` });
    return { type: 'xpath', selector, parts, specificity: 100 };
  }

  // Build path-based XPath
  const path = getNodePath(tree, node.id);
  const xpathParts: string[] = [];

  for (const current of path) {
    let part = current.tagName;
    parts.push({ type: 'tag', value: current.tagName });

    // Add predicates
    if (current.attributes.id) {
      part += `[@id="${current.attributes.id}"]`;
      parts.push({ type: 'attribute', value: `[@id="${current.attributes.id}"]` });
    } else if (current.attributes.class) {
      const firstClass = current.attributes.class.split(/\s+/)[0];
      part += `[contains(@class, "${firstClass}")]`;
      parts.push({ type: 'attribute', value: `[contains(@class, "${firstClass}")]` });
    }

    // Add position for disambiguation
    if (current.index > 0) {
      part += `[${current.index + 1}]`;
      parts.push({ type: 'nth-child', value: `[${current.index + 1}]` });
    }

    xpathParts.push(part);
  }

  return {
    type: 'xpath',
    selector: '//' + xpathParts.join('/'),
    parts,
    specificity: xpathParts.length * 10,
  };
}

export function generateSelectors(
  node: DOMTreeNode,
  tree: DOMTreeNode
): GeneratedSelector[] {
  const selectors: GeneratedSelector[] = [];

  // Simple CSS selector
  selectors.push(buildCSSSelector(node, tree));

  // Hierarchical CSS selector (if different)
  const hierarchical = buildHierarchicalCSSSelector(node, tree);
  if (hierarchical.selector !== selectors[0].selector) {
    selectors.push(hierarchical);
  }

  // XPath selector
  selectors.push(buildXPathSelector(node, tree));

  // Sort by specificity (higher first)
  return selectors.sort((a, b) => b.specificity - a.specificity);
}

export function formatSelectorForDisplay(selector: GeneratedSelector): string {
  return selector.selector;
}
