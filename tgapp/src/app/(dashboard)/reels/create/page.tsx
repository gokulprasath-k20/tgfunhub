'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateReelSchema, type CreateReelInput } from '@/lib/validators/post';
import { useCreateReel } from '@/hooks/useReels';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { UploadCloud, Film, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateReelPage() {
  const router = useRouter();
  const createReel = useCreateReel();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(CreateReelSchema.omit({ videoUrl: true })), // Validate videoUrl manually after upload
    defaultValues: { text: '' },
  });

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be less than 50MB');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: { text: string }) => {
    if (!videoFile) {
      toast.error('Please select a video');
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Upload video
      const formData = new FormData();
      formData.append('file', videoFile);

      // In a real advanced app, we'd use XHR to track progress.
      // Fetch doesn't support upload progress out of the box easily, but we'll simulate or just show 'Uploading...'
      const uploadRes = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Video upload failed');
      }

      const { url } = await uploadRes.json();

      // 2. Create Reel
      await createReel.mutateAsync({
        text: data.text,
        videoUrl: url,
      });

      router.push('/reels');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] mb-6 flex items-center gap-2">
        <Film className="w-6 h-6" />
        Create Reel
      </h1>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Video Upload Area */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]">
            Video
          </label>
          
          {!videoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[9/16] max-h-[500px] border-2 border-dashed border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#f9f9f9] dark:hover:bg-[#111111] transition-colors"
            >
              <div className="p-4 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-full">
                <UploadCloud className="w-8 h-8 text-[#525252] dark:text-[#a3a3a3]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]">
                  Click to upload video
                </p>
                <p className="text-xs text-[#a3a3a3] mt-1">
                  MP4 or WebM (Max 50MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-[9/16] max-h-[500px] bg-black rounded-xl overflow-hidden group">
              <video
                src={videoPreview}
                className="w-full h-full object-contain"
                controls
                playsInline
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa]">
            Caption (Optional)
          </label>
          <Textarea
            placeholder="Write a caption..."
            className="min-h-[100px] resize-none"
            {...register('text')}
          />
          {errors.text && (
            <p className="text-sm text-red-500">{errors.text.message as string}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          isLoading={isSubmitting || isUploading || createReel.isPending}
          disabled={!videoFile}
        >
          {isUploading ? 'Uploading Video...' : 'Share Reel'}
        </Button>
      </form>
    </div>
  );
}
