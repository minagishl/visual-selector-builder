import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-preact';
import { PixelButton } from '../ui';
import type { CanvasTransform } from '../../types';

interface CanvasControlsProps {
  transform: CanvasTransform;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function CanvasControls({
  transform,
  onZoomIn,
  onZoomOut,
  onReset,
}: CanvasControlsProps) {
  const zoomPercent = Math.round(transform.scale * 100);

  return (
    <div class="absolute bottom-4 right-4 flex flex-col gap-2">
      <div class="bg-mono-900 border border-mono-700 p-2 flex flex-col gap-1">
        <PixelButton size="sm" onClick={onZoomIn} title="Zoom In">
          <ZoomIn size={14} />
        </PixelButton>
        <div class="text-center text-xs text-mono-400 py-1">{zoomPercent}%</div>
        <PixelButton size="sm" onClick={onZoomOut} title="Zoom Out">
          <ZoomOut size={14} />
        </PixelButton>
        <div class="border-t border-mono-700 my-1" />
        <PixelButton size="sm" onClick={onReset} title="Reset View">
          <RotateCcw size={14} />
        </PixelButton>
      </div>
    </div>
  );
}
