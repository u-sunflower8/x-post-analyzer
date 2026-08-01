import { useCallback, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreenshotDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export function ScreenshotDropzone({ onFilesSelected }: ScreenshotDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length > 0) onFilesSelected(imageFiles);
    },
    [onFilesSelected],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-16 text-center transition-colors',
        isDragging ? 'border-primary bg-accent/40' : 'border-border hover:bg-accent/20',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <ImagePlus className="size-8 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">投稿のスクリーンショットをドラッグ&ドロップ</p>
        <p className="text-sm text-muted-foreground">またはクリックして複数選択（AIが自動で読み取ります）</p>
      </div>
    </div>
  );
}
