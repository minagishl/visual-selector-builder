import { SelectorDisplay } from './SelectorDisplay';
import { SelectorTester } from './SelectorTester';
import type { GeneratedSelector, SelectorType, TestResult } from '../../types';

interface SelectorBuilderProps {
  selectors: GeneratedSelector[];
  testResult: TestResult | null;
  onCopySelector: (selector: string) => void;
  onTestSelector: (selector: string, type: SelectorType) => void;
}

export function SelectorBuilder({
  selectors,
  testResult,
  onCopySelector,
  onTestSelector,
}: SelectorBuilderProps) {
  return (
    <div class="flex flex-col gap-3">
      <SelectorDisplay selectors={selectors} onCopy={onCopySelector} />
      <SelectorTester onTest={onTestSelector} testResult={testResult} />
    </div>
  );
}
