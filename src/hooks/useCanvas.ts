import { useCallback, useRef, useState, useEffect } from 'preact/hooks';
import type { CanvasTransform } from '../types';

interface UseCanvasOptions {
  initialTransform?: CanvasTransform;
  minScale?: number;
  maxScale?: number;
  onTransformChange?: (transform: CanvasTransform) => void;
}

export function useCanvas(options: UseCanvasOptions = {}) {
  const {
    initialTransform = { x: 0, y: 0, scale: 1 },
    minScale = 0.1,
    maxScale = 3,
    onTransformChange,
  } = options;

  const [transform, setTransform] = useState<CanvasTransform>(initialTransform);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const spacePressed = useRef(false);

  const updateTransform = useCallback(
    (newTransform: CanvasTransform) => {
      setTransform(newTransform);
      onTransformChange?.(newTransform);
    },
    [onTransformChange]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Start panning on middle mouse button or space + left click
      if (e.button === 1 || (e.button === 0 && spacePressed.current)) {
        e.preventDefault();
        isPanning.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
        if (containerRef.current) {
          containerRef.current.style.cursor = 'grabbing';
        }
      }
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning.current) return;

      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      setTransform((prev) => {
        const newTransform = {
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
        };
        onTransformChange?.(newTransform);
        return newTransform;
      });
    },
    [onTransformChange]
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = spacePressed.current ? 'grab' : 'default';
    }
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = -e.deltaY * 0.001;
      const newScale = Math.min(maxScale, Math.max(minScale, transform.scale * (1 + delta)));

      // Zoom centered on mouse position
      const scaleFactor = newScale / transform.scale;
      const newX = mouseX - (mouseX - transform.x) * scaleFactor;
      const newY = mouseY - (mouseY - transform.y) * scaleFactor;

      updateTransform({
        x: newX,
        y: newY,
        scale: newScale,
      });
    },
    [transform, minScale, maxScale, updateTransform]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) {
      spacePressed.current = true;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      spacePressed.current = false;
      if (containerRef.current && !isPanning.current) {
        containerRef.current.style.cursor = 'default';
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, handleKeyDown, handleKeyUp]);

  const zoomIn = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newScale = Math.min(maxScale, transform.scale * 1.2);
    const scaleFactor = newScale / transform.scale;
    const newX = centerX - (centerX - transform.x) * scaleFactor;
    const newY = centerY - (centerY - transform.y) * scaleFactor;

    updateTransform({ x: newX, y: newY, scale: newScale });
  }, [transform, maxScale, updateTransform]);

  const zoomOut = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newScale = Math.max(minScale, transform.scale / 1.2);
    const scaleFactor = newScale / transform.scale;
    const newX = centerX - (centerX - transform.x) * scaleFactor;
    const newY = centerY - (centerY - transform.y) * scaleFactor;

    updateTransform({ x: newX, y: newY, scale: newScale });
  }, [transform, minScale, updateTransform]);

  const resetView = useCallback(() => {
    updateTransform({ x: 0, y: 0, scale: 1 });
  }, [updateTransform]);

  const centerOn = useCallback(
    (x: number, y: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      updateTransform({
        x: rect.width / 2 - x * transform.scale,
        y: rect.height / 2 - y * transform.scale,
        scale: transform.scale,
      });
    },
    [transform.scale, updateTransform]
  );

  return {
    containerRef,
    transform,
    setTransform: updateTransform,
    zoomIn,
    zoomOut,
    resetView,
    centerOn,
  };
}
