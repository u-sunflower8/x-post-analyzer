import { useCallback, useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  isParsing: boolean;
  onFileSelected: (file: File) => void;
}

export function UploadDropzone({ isParsing, onFileSelected }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
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
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {isParsing ? (
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      ) : (
        <UploadCloud className="size-8 text-muted-foreground" />
      )}
      <div className="space-y-1">
        <p className="font-medium">
          {isParsing ? '読み込み中…' : 'CSVファイルをドラッグ&ドロップ'}
        </p>
        <p className="text-sm text-muted-foreground">またはクリックしてファイルを選択</p>
      </div>
    </div>
  );
}
