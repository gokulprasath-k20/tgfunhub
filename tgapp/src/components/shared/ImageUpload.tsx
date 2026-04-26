'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Loader } from './Loader';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (url: string) => void;
  size?: number;
  shape?: 'circle' | 'square';
}

export function ImageUpload({
  currentImage,
  onUpload,
  size = 80,
  shape = 'circle',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onUpload(data.url as string);
      toast.success('Photo updated');
    } catch {
      toast.error('Upload failed');
      setPreview(currentImage ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <div
        className={`${shapeClass} overflow-hidden bg-[#e5e5e5] dark:bg-[#2a2a2a] w-full h-full flex items-center justify-center`}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Profile"
            fill
            className="object-cover"
            sizes={`${size}px`}
          />
        ) : (
          <Camera className="w-6 h-6 text-[#a3a3a3]" />
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader size="sm" />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isUploading}
        className={`absolute bottom-0 right-0 w-7 h-7 bg-[#0a0a0a] dark:bg-[#fafafa] ${shapeClass} flex items-center justify-center hover:opacity-80 transition-opacity border-2 border-white dark:border-[#0a0a0a]`}
        aria-label="Change photo"
      >
        <Camera className="w-3.5 h-3.5 text-white dark:text-[#0a0a0a]" />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
        aria-label="Upload profile photo"
      />
    </div>
  );
}
