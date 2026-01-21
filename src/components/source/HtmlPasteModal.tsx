import { useState } from 'preact/hooks';
import { X, Check } from 'lucide-preact';
import { PixelButton, PixelPanel } from '../ui';

interface HtmlPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (html: string) => void;
}

export function HtmlPasteModal({
  isOpen,
  onClose,
  onSubmit,
}: HtmlPasteModalProps) {
  const [html, setHtml] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (html.trim()) {
      onSubmit(html.trim());
      setHtml('');
      onClose();
    }
  };

  return (
    <div
      class="fixed inset-0 bg-mono-950/90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <PixelPanel className="w-[600px] max-w-[90vw]">
          <div class="flex items-center justify-between px-4 py-3 border-b border-mono-700">
            <h2 class="text-sm font-medium text-mono-100">PASTE HTML</h2>
            <PixelButton size="sm" onClick={onClose}>
              <X size={14} />
            </PixelButton>
          </div>

          <div class="p-4">
            <textarea
              value={html}
              onInput={(e) => setHtml((e.target as HTMLTextAreaElement).value)}
              placeholder="Paste your HTML code here..."
              class="w-full h-64 p-3 bg-mono-950 text-mono-100 border border-mono-700 font-mono text-sm resize-none focus:border-mono-400 outline-none placeholder:text-mono-600"
            />

            <div class="flex justify-end gap-2 mt-4">
              <PixelButton onClick={onClose}>Cancel</PixelButton>
              <PixelButton
                variant="success"
                onClick={handleSubmit}
                disabled={!html.trim()}
              >
                <div class="flex items-center gap-2">
                  <Check size={14} />
                  <span>Parse HTML</span>
                </div>
              </PixelButton>
            </div>
          </div>
        </PixelPanel>
      </div>
    </div>
  );
}
