import type { ComponentChildren } from 'preact';
import { useCanvas } from '../../hooks/useCanvas';
import { CanvasGrid } from './CanvasGrid';
import { CanvasControls } from './CanvasControls';
import type { CanvasTransform } from '../../types';

interface InfiniteCanvasProps {
  children: ComponentChildren;
  onTransformChange?: (transform: CanvasTransform) => void;
  initialTransform?: CanvasTransform;
}

export function InfiniteCanvas({
  children,
  onTransformChange,
  initialTransform,
}: InfiniteCanvasProps) {
  const { containerRef, transform, zoomIn, zoomOut, resetView } = useCanvas({
    initialTransform,
    onTransformChange,
  });

  return (
    <div
      ref={containerRef}
      class="relative w-full h-full overflow-hidden bg-mono-950 select-none"
    >
      <CanvasGrid transform={transform} />

      <div
        class="absolute origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      <CanvasControls
        transform={transform}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetView}
      />

      <div class="absolute bottom-4 left-4 bg-mono-900 border border-mono-700 px-2 py-1 text-xs text-mono-500">
        Pan: Middle mouse or Space + drag | Zoom: Scroll wheel
      </div>
    </div>
  );
}
