import type { CanvasTransform } from '../../types';

interface CanvasGridProps {
  transform: CanvasTransform;
}

export function CanvasGrid({ transform }: CanvasGridProps) {
  const gridSize = 32;
  const scaledGridSize = gridSize * transform.scale;
  const offsetX = transform.x % scaledGridSize;
  const offsetY = transform.y % scaledGridSize;

  return (
    <div
      class="absolute inset-0 pointer-events-none opacity-30"
      style={{
        backgroundImage: `
          linear-gradient(to right, #404040 1px, transparent 1px),
          linear-gradient(to bottom, #404040 1px, transparent 1px)
        `,
        backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  );
}
