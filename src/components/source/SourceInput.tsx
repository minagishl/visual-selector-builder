import { useState } from 'preact/hooks';
import { Link, ClipboardPaste } from 'lucide-preact';
import { PixelButton, PixelInput } from '../ui';

interface SourceInputProps {
  onLoadUrl: (url: string) => void;
  onOpenPasteModal: () => void;
  loading: boolean;
}

export function SourceInput({
  onLoadUrl,
  onOpenPasteModal,
  loading,
}: SourceInputProps) {
  const [url, setUrl] = useState('');

  const handleLoadUrl = () => {
    if (url.trim()) {
      onLoadUrl(url.trim());
    }
  };

  return (
    <div class="flex items-center gap-2 flex-1">
      <div class="flex-1">
        <PixelInput
          value={url}
          onChange={setUrl}
          placeholder="Enter URL to load HTML..."
          type="url"
          disabled={loading}
        />
      </div>

      <PixelButton
        variant="primary"
        onClick={handleLoadUrl}
        disabled={loading || !url.trim()}
        title="Load URL"
      >
        <div class="flex items-center gap-2">
          <Link size={14} />
          <span>Load</span>
        </div>
      </PixelButton>

      <div class="text-mono-500">or</div>

      <PixelButton onClick={onOpenPasteModal} disabled={loading} title="Paste HTML">
        <div class="flex items-center gap-2">
          <ClipboardPaste size={14} />
          <span>Paste</span>
        </div>
      </PixelButton>
    </div>
  );
}
