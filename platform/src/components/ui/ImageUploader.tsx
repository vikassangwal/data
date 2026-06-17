'use client';

import { useState, useRef } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import Button from './Button';
import Image from 'next/image';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Upload Image',
  className = '',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (result: any) => {
    if (result.info && result.info.secure_url) {
      onChange(result.info.secure_url);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const isPdf = value && (value.toLowerCase().endsWith('.pdf') || value.toLowerCase().includes('.pdf'));

  return (
    <div className={`space-y-4 flex flex-col items-start ${className}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.pdf,.doc,.docx"
      />

      {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset'}
          onSuccess={handleUpload}
          options={{
            multiple: false,
            maxFiles: 1,
            resourceType: 'auto',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg', 'pdf', 'doc', 'docx'],
          }}
        >
          {({ open }) => {
            return (
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={(e) => {
                  e.preventDefault();
                  open();
                }}
                icon={isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              >
                {isUploading ? 'Uploading...' : label}
              </Button>
            );
          }}
        </CldUploadWidget>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          icon={isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
        >
          {isUploading ? 'Uploading...' : label}
        </Button>
      )}

      {/* Preview Section */}
      {value ? (
        <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border mt-4">
          {isPdf ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-slate-950 border border-white/10 rounded-lg p-2 text-center text-xs text-white">
              <span className="font-bold uppercase tracking-wider text-rose-500 mb-1">PDF File</span>
              <span className="text-[10px] text-muted-foreground truncate w-full px-2">
                {value.split('/').pop()}
              </span>
            </div>
          ) : (
            <Image
              src={value}
              alt="Upload preview"
              fill
              className="object-cover"
            />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center w-40 h-40 rounded-lg border-2 border-dashed border-border bg-card/50 text-muted-foreground mt-4">
          <div className="flex flex-col items-center">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm">No file</span>
          </div>
        </div>
      )}
    </div>
  );
}
