import { useState } from 'preact/hooks';
import { Search } from 'lucide-preact';
import { PixelButton, PixelInput, PixelPanel } from '../ui';
import type { SelectorType, TestResult } from '../../types';

interface SelectorTesterProps {
  onTest: (selector: string, type: SelectorType) => void;
  testResult: TestResult | null;
}

export function SelectorTester({ onTest, testResult }: SelectorTesterProps) {
  const [selector, setSelector] = useState('');
  const [selectorType, setSelectorType] = useState<SelectorType>('css');

  const handleTest = () => {
    if (selector.trim()) {
      onTest(selector.trim(), selectorType);
    }
  };

  return (
    <PixelPanel title="Test Selector">
      <div class="flex flex-col gap-3">
        <div class="flex gap-2">
          <button
            type="button"
            class={`flex-1 py-1 text-sm border transition-colors ${
              selectorType === 'css'
                ? 'bg-mono-100 text-mono-900 border-mono-100'
                : 'bg-mono-800 text-mono-400 border-mono-700 hover:bg-mono-700'
            }`}
            onClick={() => setSelectorType('css')}
          >
            CSS
          </button>
          <button
            type="button"
            class={`flex-1 py-1 text-sm border transition-colors ${
              selectorType === 'xpath'
                ? 'bg-mono-100 text-mono-900 border-mono-100'
                : 'bg-mono-800 text-mono-400 border-mono-700 hover:bg-mono-700'
            }`}
            onClick={() => setSelectorType('xpath')}
          >
            XPath
          </button>
        </div>

        <div class="flex gap-2">
          <div class="flex-1">
            <PixelInput
              value={selector}
              onChange={setSelector}
              placeholder={
                selectorType === 'css'
                  ? 'div.class > p'
                  : '//div[@class="example"]'
              }
            />
          </div>
          <PixelButton variant="primary" onClick={handleTest}>
            <Search size={14} />
          </PixelButton>
        </div>

        {testResult && (
          <div
            class={`p-2 border ${
              testResult.error
                ? 'bg-mono-900 border-mono-500 text-mono-300'
                : testResult.matchCount > 0
                  ? 'bg-mono-800 border-mono-400 text-mono-100'
                  : 'bg-mono-900 border-mono-600 text-mono-400'
            }`}
          >
            {testResult.error ? (
              <div class="text-sm">
                <strong>Error:</strong> {testResult.error}
              </div>
            ) : (
              <div class="text-sm">
                <span class="text-mono-400">Matches: </span>
                <span
                  class={testResult.matchCount > 0 ? 'text-mono-100 font-bold' : ''}
                >
                  {testResult.matchCount}
                </span>
                {testResult.matchCount > 0 && (
                  <span class="text-mono-500 ml-2">(highlighted in tree)</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </PixelPanel>
  );
}
