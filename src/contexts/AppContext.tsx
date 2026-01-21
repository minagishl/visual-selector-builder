import { createContext } from 'preact';
import { useContext, useReducer, useCallback } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { AppState, AppAction, SelectorType } from '../types';
import { parseHTML, fetchHTML, findNodeById, getAllNodeIds, countNodes } from '../lib/dom/parser';
import { generateSelectors } from '../lib/selector/builder';
import { testSelector } from '../lib/selector/tester';

const initialState: AppState = {
  source: null,
  htmlContent: null,
  loading: false,
  error: null,
  domTree: null,
  expandedNodes: new Set<string>(),
  selectedNodeId: null,
  hoveredNodeId: null,
  highlightedNodeIds: new Set<string>(),
  generatedSelectors: [],
  customSelector: '',
  customSelectorType: 'css',
  testResults: null,
  transform: { x: 0, y: 0, scale: 1 },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SOURCE':
      return { ...state, source: action.payload };

    case 'SET_HTML_CONTENT':
      return { ...state, htmlContent: action.payload };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_DOM_TREE': {
      const tree = action.payload;
      // Auto-expand root and first level
      const expandedNodes = new Set<string>();
      if (tree) {
        expandedNodes.add(tree.id);
        for (const child of tree.children) {
          expandedNodes.add(child.id);
        }
      }
      return {
        ...state,
        domTree: tree,
        expandedNodes,
        selectedNodeId: null,
        hoveredNodeId: null,
        highlightedNodeIds: new Set(),
        generatedSelectors: [],
        testResults: null,
      };
    }

    case 'TOGGLE_NODE_EXPANDED': {
      const expandedNodes = new Set(state.expandedNodes);
      if (expandedNodes.has(action.payload)) {
        expandedNodes.delete(action.payload);
      } else {
        expandedNodes.add(action.payload);
      }
      return { ...state, expandedNodes };
    }

    case 'EXPAND_ALL_NODES': {
      const allIds = state.domTree ? getAllNodeIds(state.domTree) : new Set<string>();
      return { ...state, expandedNodes: allIds };
    }

    case 'COLLAPSE_ALL_NODES': {
      const expandedNodes = new Set<string>();
      if (state.domTree) {
        expandedNodes.add(state.domTree.id);
      }
      return { ...state, expandedNodes };
    }

    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.payload,
        highlightedNodeIds: new Set(),
        testResults: null,
      };

    case 'HOVER_NODE':
      return { ...state, hoveredNodeId: action.payload };

    case 'SET_HIGHLIGHTED_NODES':
      return { ...state, highlightedNodeIds: action.payload };

    case 'SET_GENERATED_SELECTORS':
      return { ...state, generatedSelectors: action.payload };

    case 'SET_CUSTOM_SELECTOR':
      return { ...state, customSelector: action.payload };

    case 'SET_CUSTOM_SELECTOR_TYPE':
      return { ...state, customSelectorType: action.payload };

    case 'SET_TEST_RESULTS':
      return {
        ...state,
        testResults: action.payload,
        highlightedNodeIds: action.payload
          ? new Set(action.payload.matchedNodeIds)
          : new Set(),
      };

    case 'SET_TRANSFORM':
      return { ...state, transform: action.payload };

    case 'RESET_TRANSFORM':
      return { ...state, transform: { x: 0, y: 0, scale: 1 } };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
  loadFromUrl: (url: string) => Promise<void>;
  loadFromHtml: (html: string) => void;
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  toggleNodeExpanded: (id: string) => void;
  expandAllNodes: () => void;
  collapseAllNodes: () => void;
  testCustomSelector: (selector: string, type: SelectorType) => void;
  copyToClipboard: (text: string) => Promise<void>;
  nodeCount: number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ComponentChildren }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const loadFromUrl = useCallback(async (url: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const html = await fetchHTML(url);
      const tree = parseHTML(html);

      if (!tree) {
        throw new Error('Failed to parse HTML - no valid elements found');
      }

      dispatch({ type: 'SET_SOURCE', payload: { type: 'url', value: url } });
      dispatch({ type: 'SET_HTML_CONTENT', payload: html });
      dispatch({ type: 'SET_DOM_TREE', payload: tree });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load URL',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadFromHtml = useCallback((html: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const tree = parseHTML(html);

      if (!tree) {
        throw new Error('Failed to parse HTML - no valid elements found');
      }

      dispatch({ type: 'SET_SOURCE', payload: { type: 'paste', value: html } });
      dispatch({ type: 'SET_HTML_CONTENT', payload: html });
      dispatch({ type: 'SET_DOM_TREE', payload: tree });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to parse HTML',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const selectNode = useCallback(
    (id: string | null) => {
      dispatch({ type: 'SELECT_NODE', payload: id });

      if (id && state.domTree) {
        const node = findNodeById(state.domTree, id);
        if (node) {
          const selectors = generateSelectors(node, state.domTree);
          dispatch({ type: 'SET_GENERATED_SELECTORS', payload: selectors });
        }
      } else {
        dispatch({ type: 'SET_GENERATED_SELECTORS', payload: [] });
      }
    },
    [state.domTree]
  );

  const hoverNode = useCallback((id: string | null) => {
    dispatch({ type: 'HOVER_NODE', payload: id });
  }, []);

  const toggleNodeExpanded = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_NODE_EXPANDED', payload: id });
  }, []);

  const expandAllNodes = useCallback(() => {
    dispatch({ type: 'EXPAND_ALL_NODES' });
  }, []);

  const collapseAllNodes = useCallback(() => {
    dispatch({ type: 'COLLAPSE_ALL_NODES' });
  }, []);

  const testCustomSelector = useCallback(
    (selector: string, type: SelectorType) => {
      if (!state.domTree) return;

      const result = testSelector(selector, type, state.domTree);
      dispatch({ type: 'SET_TEST_RESULTS', payload: result });
    },
    [state.domTree]
  );

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  const nodeCount = state.domTree ? countNodes(state.domTree) : 0;

  const value: AppContextValue = {
    state,
    dispatch,
    loadFromUrl,
    loadFromHtml,
    selectNode,
    hoverNode,
    toggleNodeExpanded,
    expandAllNodes,
    collapseAllNodes,
    testCustomSelector,
    copyToClipboard,
    nodeCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
