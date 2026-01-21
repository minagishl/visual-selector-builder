import { useState, useEffect, useCallback } from 'preact/hooks';
import { Expand, Shrink, ClipboardPaste } from 'lucide-preact';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header, ToolPanel, StatusBar } from './components/layout';
import { InfiniteCanvas } from './components/canvas';
import { DOMTreeView } from './components/tree';
import { SelectorBuilder } from './components/selector';
import { SourceInput, HtmlPasteModal } from './components/source';
import { PixelButton, PixelPanel } from './components/ui';

function AppContent() {
  const {
    state,
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
  } = useApp();

  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectNode(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (state.generatedSelectors.length > 0 && state.selectedNodeId) {
          e.preventDefault();
          copyToClipboard(state.generatedSelectors[0].selector);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.generatedSelectors, state.selectedNodeId, selectNode, copyToClipboard]);

  const handleCopySelector = useCallback(
    (selector: string) => {
      copyToClipboard(selector);
    },
    [copyToClipboard]
  );

  const selectedNodeTag =
    state.selectedNodeId && state.domTree
      ? (() => {
          const findNode = (node: typeof state.domTree): string | null => {
            if (!node) return null;
            if (node.id === state.selectedNodeId) return `<${node.tagName}>`;
            for (const child of node.children) {
              const found = findNode(child);
              if (found) return found;
            }
            return null;
          };
          return findNode(state.domTree);
        })()
      : null;

  return (
    <div class="h-full flex flex-col bg-mono-950 text-mono-100">
      <Header>
        <SourceInput
          onLoadUrl={loadFromUrl}
          onOpenPasteModal={() => setIsPasteModalOpen(true)}
          loading={state.loading}
        />

        {state.loading && (
          <div class="text-mono-400 text-sm animate-pulse">Loading...</div>
        )}
      </Header>

      <div class="flex-1 flex overflow-hidden">
        <div class="flex-1 relative">
          {state.error && (
            <div class="absolute top-4 left-4 right-4 z-10">
              <PixelPanel className="bg-mono-900 border-mono-500">
                <div class="p-3 flex items-center justify-between">
                  <span class="text-mono-300">{state.error}</span>
                </div>
              </PixelPanel>
            </div>
          )}

          {state.domTree ? (
            <InfiniteCanvas>
              <DOMTreeView
                tree={state.domTree}
                expandedNodes={state.expandedNodes}
                selectedNodeId={state.selectedNodeId}
                hoveredNodeId={state.hoveredNodeId}
                highlightedNodeIds={state.highlightedNodeIds}
                onSelectNode={selectNode}
                onHoverNode={hoverNode}
                onToggleExpand={toggleNodeExpanded}
              />
            </InfiniteCanvas>
          ) : (
            <div class="h-full flex items-center justify-center">
              <PixelPanel className="p-8 max-w-md text-center">
                <div class="text-lg font-medium text-mono-100 mb-4">
                  Welcome
                </div>
                <p class="text-mono-400 mb-6">
                  Load HTML from a URL or paste your HTML code to visualize the
                  DOM tree and generate CSS/XPath selectors.
                </p>
                <div class="flex justify-center gap-4">
                  <PixelButton
                    variant="primary"
                    onClick={() => setIsPasteModalOpen(true)}
                  >
                    <div class="flex items-center gap-2">
                      <ClipboardPaste size={14} />
                      <span>Paste HTML</span>
                    </div>
                  </PixelButton>
                </div>

                <div class="mt-6 pt-4 border-t border-mono-700">
                  <p class="text-mono-500 text-sm mb-3">
                    Or try with sample HTML:
                  </p>
                  <PixelButton
                    size="sm"
                    onClick={() => {
                      const sampleHtml = `
<div class="container" id="main">
  <header class="header">
    <h1 class="title">Welcome</h1>
    <nav class="nav">
      <a href="#" class="link">Home</a>
      <a href="#" class="link">About</a>
      <a href="#" class="link">Contact</a>
    </nav>
  </header>
  <main class="content">
    <article class="card" data-id="1">
      <h2 class="card-title">First Card</h2>
      <p class="card-text">This is some sample content.</p>
      <button class="btn btn-primary">Read More</button>
    </article>
    <article class="card" data-id="2">
      <h2 class="card-title">Second Card</h2>
      <p class="card-text">Another piece of content here.</p>
      <button class="btn btn-secondary">Learn More</button>
    </article>
  </main>
  <footer class="footer">
    <p>&copy; 2024 Sample Site</p>
  </footer>
</div>`.trim();
                      loadFromHtml(sampleHtml);
                    }}
                  >
                    Load Sample
                  </PixelButton>
                </div>
              </PixelPanel>
            </div>
          )}
        </div>

        {state.domTree && (
          <ToolPanel>
            <PixelPanel title="Tree Controls">
              <div class="flex gap-2">
                <PixelButton size="sm" onClick={expandAllNodes}>
                  <div class="flex items-center gap-1">
                    <Expand size={12} />
                    <span>Expand All</span>
                  </div>
                </PixelButton>
                <PixelButton size="sm" onClick={collapseAllNodes}>
                  <div class="flex items-center gap-1">
                    <Shrink size={12} />
                    <span>Collapse</span>
                  </div>
                </PixelButton>
              </div>
            </PixelPanel>

            <SelectorBuilder
              selectors={state.generatedSelectors}
              testResult={state.testResults}
              onCopySelector={handleCopySelector}
              onTestSelector={testCustomSelector}
            />
          </ToolPanel>
        )}
      </div>

      <StatusBar
        selectedNode={selectedNodeTag}
        nodeCount={nodeCount}
        matchCount={state.testResults?.matchCount}
      />

      <HtmlPasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onSubmit={loadFromHtml}
      />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
