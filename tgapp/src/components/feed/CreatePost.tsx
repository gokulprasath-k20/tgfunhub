'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ImagePlus, X, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePostSchema, type CreatePostInput } from '@/lib/validators/post';
import { useAuthStore } from '@/store/authStore';
import { useCreatePost } from '@/hooks/usePosts';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const { user } = useAuthStore();
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: { text: '', images: [] },
  });

  const textValue = watch('text');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images per post');
      return;
    }

    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        uploaded.push(data.url as string);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onSubmit = (data: CreatePostInput) => {
    createPost.mutate(
      { text: data.text, images },
      {
        onSuccess: () => {
          reset();
          setImages([]);
          onPostCreated?.();
        },
      }
    );
  };

  return (
    <div className="card p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#e5e5e5] dark:bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center overflow-hidden">
          {user?.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.username}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-sm font-semibold text-[#525252] dark:text-[#a3a3a3]">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-w-0">
          <Textarea
            {...register('text')}
            value={textValue}
            placeholder="What's on your mind?"
            showCount
            maxLength={280}
            error={errors.text?.message}
            className="border-0 bg-transparent dark:bg-transparent px-0 py-0 focus:ring-0 min-h-[64px] resize-none text-[15px] placeholder-[#a3a3a3]"
          />

          {/* Image previews */}
          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#f9f9f9] dark:bg-[#1a1a1a]"
                >
                  <Image
                    src={url}
                    alt={`preview ${i}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f0f0] dark:border-[#1f1f1f]">
            <div className="flex items-center gap-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="post-image-upload"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={images.length >= 4 || isUploading}
                className="btn-ghost p-2 rounded-md disabled:opacity-40"
                aria-label="Add images"
                title={images.length >= 4 ? 'Maximum 4 images' : 'Add images'}
              >
                <ImagePlus className="w-4 h-4" />
              </button>
            </div>

            <Button
              type="submit"
              size="sm"
              isLoading={createPost.isPending || isUploading}
              disabled={!textValue?.trim() || createPost.isPending || isUploading}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
