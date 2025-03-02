import React, { useRef, useState } from 'react';

interface VideoPlayerProps {
  videoUrl?: string;
  onVideoUpload?: (url: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onVideoUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | undefined>(videoUrl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onVideoUpload) {
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      onVideoUpload(url);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
      {localVideoUrl ? (
        <video
          className="w-full h-full object-cover"
          controls
          src={localVideoUrl}
        />
      ) : onVideoUpload ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            上传视频
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          暂无视频
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}; 