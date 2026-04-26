'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateVideo } from '@/hooks/useVideos';
import { Upload, Video, Image as ImageIcon, Loader2, PlaySquare } from 'lucide-react';

export default function CreateVideoPage() {
  const router = useRouter();
  const { mutateAsync: createVideo } = useCreateVideo();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024 * 1024) {
        alert('Video must be less than 100MB');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Thumbnail must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
    }
  };

  const uploadFile = async (file: File, type: 'video' | 'image'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = type === 'video' ? '/api/upload/video' : '/api/upload';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) throw new Error(`Failed to upload ${type}`);
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoFile) {
      alert('Title and Video are required');
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10);
      
      let thumbnailUrl = '';
      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'image');
        setProgress(30);
      }
      
      const videoUrl = await uploadFile(videoFile, 'video');
      setProgress(80);
      
      await createVideo({
        title,
        text: description,
        videoUrl,
        thumbnailUrl,
      });
      
      setProgress(100);
      router.push('/videos');
    } catch (err: any) {
      console.error('Upload failed', err);
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#fafafa] flex items-center gap-2">
          <PlaySquare className="w-6 h-6" />
          Upload Video
        </h1>
        <p className="text-[#525252] dark:text-[#a3a3a3] mt-2">
          Share long-form video content with your audience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-sm">
        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa] mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your video a catchy title"
              className="w-full px-4 py-3 rounded-xl bg-[#f0f0f0] dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-[#0a0a0a] dark:focus:ring-[#fafafa] text-[#0a0a0a] dark:text-[#fafafa] placeholder-[#a3a3a3]"
              maxLength={100}
              required
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-[#f0f0f0] dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-[#0a0a0a] dark:focus:ring-[#fafafa] text-[#0a0a0a] dark:text-[#fafafa] placeholder-[#a3a3a3] resize-none"
              maxLength={2000}
              disabled={isUploading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa] mb-1">
              Video File <span className="text-red-500">*</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl cursor-pointer hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-colors relative overflow-hidden group">
              {videoFile ? (
                <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
                  <Video className="w-12 h-12 text-[#525252]" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm font-medium">Change Video</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-[#a3a3a3] mb-3" />
                  <p className="text-sm text-[#525252] dark:text-[#a3a3a3] font-medium text-center">
                    Click to upload
                  </p>
                  <p className="text-xs text-[#a3a3a3] mt-1 text-center">
                    MP4, WebM (Max 100MB)
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={handleVideoSelect}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] dark:text-[#fafafa] mb-1">
              Custom Thumbnail
            </label>
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl cursor-pointer hover:bg-[#f9f9f9] dark:hover:bg-[#1a1a1a] transition-colors relative overflow-hidden group">
              {thumbnailFile ? (
                <img
                  src={URL.createObjectURL(thumbnailFile)}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 text-[#a3a3a3] mb-3" />
                  <p className="text-sm text-[#525252] dark:text-[#a3a3a3] font-medium text-center">
                    Click to upload
                  </p>
                  <p className="text-xs text-[#a3a3a3] mt-1 text-center">
                    JPG, PNG (Max 5MB)
                  </p>
                </div>
              )}
              {thumbnailFile && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm font-medium">Change Thumbnail</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailSelect}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isUploading || !title.trim() || !videoFile}
          className="w-full h-12 bg-[#0a0a0a] dark:bg-[#fafafa] text-white dark:text-black rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity relative overflow-hidden"
        >
          {isUploading && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white/20 dark:bg-black/10 transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          )}
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin relative z-10" />
              <span className="relative z-10">Uploading... {progress}%</span>
            </>
          ) : (
            'Publish Video'
          )}
        </button>
      </form>
    </div>
  );
}
