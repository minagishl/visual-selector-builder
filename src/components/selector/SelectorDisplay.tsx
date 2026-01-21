import { Copy } from 'lucide-preact';
import { PixelButton, PixelPanel } from '../ui';
import type { GeneratedSelector } from '../../types';

interface SelectorDisplayProps {
  selectors: GeneratedSelector[];
  onCopy: (selector: string) => void;
}

export function SelectorDisplay({ selectors, onCopy }: SelectorDisplayProps) {
  if (selectors.length === 0) {
    return (
      <PixelPanel title="Generated Selectors">
        <p class="text-mono-500 text-sm">
          Click on a node to generate selectors
        </p>
      </PixelPanel>
    );
  }

  return (
    <PixelPanel title="Generated Selectors">
      <div class="flex flex-col gap-3">
        {selectors.map((selector, index) => (
          <div key={index} class="flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <span class="text-xs px-2 py-0.5 bg-mono-800 text-mono-300 border border-mono-600">
                {selector.type.toUpperCase()}
              </span>
              <PixelButton
                size="sm"
                onClick={() => onCopy(selector.selector)}
                title="Copy to clipboard"
              >
                <Copy size={12} />
              </PixelButton>
            </div>

            <div class="bg-mono-950 p-2 border border-mono-700 overflow-x-auto">
              <code class="text-sm text-mono-100 whitespace-nowrap">
                {selector.selector}
              </code>
            </div>

            <div class="flex flex-wrap gap-1">
              {selector.parts.map((part, i) => (
                <span
                  key={i}
                  class={`text-xs px-1.5 py-0.5 ${
                    part.type === 'combinator'
                      ? 'text-mono-500'
                      : 'bg-mono-800 text-mono-300'
                  }`}
                >
                  {part.value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PixelPanel>
  );
}
