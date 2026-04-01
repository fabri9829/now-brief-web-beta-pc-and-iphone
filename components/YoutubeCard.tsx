import React, { useRef, useState } from 'react';
import { Youtube, Play, Info } from 'lucide-react';
import { YoutubeVideo } from '../types';

export const YoutubeCard: React.FC<{ uploads: YoutubeVideo[], isNight?: boolean, onImageLoad?: () => void }> = ({ uploads, isNight, onImageLoad }) => {
  return (
    <div className={`${isNight ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-gray-100'} rounded-[28px] p-6 w-full shadow-sm border transition-colors duration-1000 flex flex-col gap-6`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${isNight ? 'bg-red-500/10' : 'bg-red-50'} flex items-center justify-center`}>
          <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
        </div>
        <span className={`text-[14px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>Subidas recientes</span>
      </div>

      <div className="space-y-8">
        {uploads && uploads.length > 0 ? (
          uploads.map((video, idx) => (
            <VideoItem key={idx} video={video} isNight={isNight} onImageLoad={onImageLoad} />
          ))
        ) : (
          <p className={`text-[13px] ${isNight ? 'text-white/40' : 'text-gray-400'} py-4 text-center`}>No se encontraron subidas recientes.</p>
        )}
      </div>

      <div className={`flex justify-end gap-3 mt-4 pt-4 border-t ${isNight ? 'border-white/5' : 'border-gray-50'} items-center`}>
        <span className={`text-[10px] ${isNight ? 'text-white/40' : 'text-gray-400'} font-bold tracking-tight uppercase`}>Toca para reproducir • Mantén para reproducir automáticamente</span>
        <Info className={`w-3.5 h-3.5 ${isNight ? 'text-white/30' : 'text-gray-300'}`} />
      </div>
    </div>
  );
};

const VideoItem: React.FC<{ video: YoutubeVideo, isNight?: boolean, onImageLoad?: () => void }> = ({ video, isNight, onImageLoad }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const openSearch = () => {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title + ' ' + video.channel)}`;
    window.open(searchUrl, '_blank');
  };

  const openVideo = () => {
    // Always perform a search instead of direct play as per user request
    openSearch();
  };

  const handleMouseDown = () => {
    setIsLongPressing(false);
    timerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      openSearch();
    }, 1000);
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressing) {
      e.preventDefault();
      return;
    }
    openVideo();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const currentSrc = img.src;

    // YouTube fallback chain: maxresdefault -> hqdefault -> mqdefault -> sddefault -> default
    if (currentSrc.includes('maxresdefault')) {
      img.src = currentSrc.replace('maxresdefault', 'hqdefault');
    } else if (currentSrc.includes('hqdefault')) {
      img.src = currentSrc.replace('hqdefault', 'mqdefault');
    } else if (currentSrc.includes('mqdefault')) {
      img.src = currentSrc.replace('mqdefault', 'sddefault');
    } else if (currentSrc.includes('sddefault')) {
      img.src = currentSrc.replace('sddefault', 'default');
    } else {
      // Final fallback if all YouTube thumbnails fail
      img.src = `https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&q=80`; // A nice general tech/media background
      onImageLoad?.(); 
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // YouTube returns a 120x90 "not found" image if the requested quality doesn't exist
    // This is the most common reason for the "Netflix cube" or generic placeholder look
    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
      handleImageError(e);
    } else {
      onImageLoad?.();
    }
  };

  // Extract video ID for a more reliable fallback if thumbnail is missing
  const videoId = video.videoId || (video.url?.includes('v=') 
    ? video.url.split('v=')[1]?.split('&')[0] 
    : (video.url?.includes('youtu.be/') ? video.url.split('youtu.be/')[1]?.split('?')[0] : null));
  
  // Use hqdefault as a safer starting point if maxresdefault is known to be flaky, 
  // but we'll stick to maxresdefault for quality and rely on the error handler
  const thumbUrl = videoId 
    ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : (video.thumbnail && video.thumbnail.startsWith('http') ? video.thumbnail : `https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&q=80`);

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
      className="flex flex-col gap-3 group cursor-pointer active:scale-[0.98] transition-transform select-none"
    >
      <div className={`relative aspect-video rounded-[24px] overflow-hidden ${isNight ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-50'} shadow-sm border`}>
        <img 
          src={thumbUrl} 
          alt={video.title} 
          loading="eager"
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
              <Play className="w-5 h-5 text-black fill-black ml-1" />
           </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3 className={`text-[15px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'} leading-tight tracking-tight line-clamp-2`}>
          {video.title}
        </h3>
        <div className={`flex items-center gap-2 text-[11px] ${isNight ? 'text-white/40' : 'text-gray-400'} font-bold uppercase tracking-wider`}>
          <span>{video.channel}</span>
          <span className={`w-1 h-1 rounded-full ${isNight ? 'bg-white/20' : 'bg-gray-200'}`} />
          <span>{video.views} vistas</span>
          <span className={`w-1 h-1 rounded-full ${isNight ? 'bg-white/20' : 'bg-gray-200'}`} />
          <span>{video.time}</span>
        </div>
      </div>
    </div>
  );
};