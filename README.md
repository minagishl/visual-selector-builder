## Visual Selector Builder

Interactive tool to **visualize an HTML DOM tree** and **generate CSS/XPath selectors** by clicking nodes.

Built with **Preact + Vite + Tailwind CSS**, and designed around an infinite canvas (pan/zoom) for exploring large trees.

## Features

- **Load HTML**
  - **From a URL** (fetches HTML in the browser; includes CORS-proxy fallback)
  - **By pasting HTML** into a modal
  - **Sample HTML** loader for quick testing
- **DOM tree visualization**
  - Infinite canvas with **pan** and **zoom**
  - Expand/collapse nodes; expand all / collapse to root
- **Selector generation**
  - Click any node to generate multiple selectors:
    - **CSS**: best-effort short selector and a hierarchical selector
    - **XPath**: best-effort path selector (uses `@id` when present)
  - One-click copy to clipboard
- **Selector testing**
  - Test **CSS** or **XPath** against the loaded DOM
  - Highlights matched nodes and shows match count

## Quick start

This repo is configured to use **Bun** as the package manager.

```bash
bun install
bun dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).

## Scripts

```bash
# Start dev server
bun dev

# Typecheck + build production assets
bun run build

# Preview the production build locally
bun run preview
```

## How to use

- **Load a page**
  - Paste a URL into the top input and click **Load**, or click **Paste** to paste HTML.
- **Explore**
  - Pan/zoom the canvas to navigate the tree.
  - Use **Expand All** / **Collapse** from the right panel to control tree expansion.
- **Generate selectors**
  - Click a node in the tree. Generated selectors appear in the right panel.
  - Click the copy icon to copy a selector.
- **Test selectors**
  - Use **Test Selector** to run a CSS or XPath query against the loaded DOM.
  - Matches are highlighted on the tree and the match count appears in the status bar.

## Controls and shortcuts

- **Canvas**
  - **Pan**: middle mouse drag, or **Space + drag**
  - **Zoom**: mouse wheel / trackpad scroll
  - **Reset view**: use the reset button in the bottom-right controls
- **Selection**
  - **Clear selection**: `Esc`
  - **Copy top generated selector**: `Ctrl/Cmd + C` (when a node is selected and selectors are available)

## Notes and limitations

- **URL loading & CORS**: fetching HTML from arbitrary sites often fails due to browser CORS restrictions. The app attempts direct fetch first, then falls back to public CORS proxies. Some sites may still fail to load.
- **Parser scope**: the app parses static HTML into a DOM tree for visualization and selector testing. It does not execute scripts.

## Project structure (high level)

- `src/app.tsx`: main UI composition
- `src/contexts/AppContext.tsx`: global state (DOM tree, selection, generated selectors, test results)
- `src/lib/dom/parser.ts`: HTML fetch + parsing into `DOMTreeNode`
- `src/lib/selector/builder.ts`: selector generation (CSS + XPath)
- `src/lib/selector/tester.ts`: selector evaluation (CSS via `querySelectorAll`, XPath via `document.evaluate`)
- `src/components/`: UI components (canvas, tree view, selector panel, source input)

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
