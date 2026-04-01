import React, { useRef } from 'react';
import { Music, Play, Info } from 'lucide-react';
import { SpotifyItem } from '../types';

export const SpotifyCard: React.FC<{ items: SpotifyItem[], isNight?: boolean, onImageLoad?: () => void }> = ({ items, isNight, onImageLoad }) => {
  return (
    <div className={`${isNight ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-gray-100'} rounded-[28px] p-6 w-full shadow-sm border transition-colors duration-1000 flex flex-col gap-5`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${isNight ? 'bg-green-500/10' : 'bg-green-50'} flex items-center justify-center`}>
          <Music className={`w-4 h-4 ${isNight ? 'text-green-400' : 'text-green-600'}`} />
        </div>
      </div>

      <div className="space-y-4">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <TrackItem key={idx} item={item} isNight={isNight} onImageLoad={onImageLoad} />
          ))
        ) : (
          <p className={`text-[13px] ${isNight ? 'text-white/40' : 'text-gray-400'} py-2 text-center`}>Buscando las canciones adecuadas para ti...</p>
        )}
      </div>

      <div className={`flex justify-end gap-3 mt-2 pt-4 border-t ${isNight ? 'border-white/5' : 'border-gray-50'} items-center`}>
        <span className={`text-[10px] ${isNight ? 'text-white/40' : 'text-gray-400'} font-bold tracking-tight uppercase`}>Toca para abrir Spotify</span>
        <Info className={`w-3.5 h-3.5 ${isNight ? 'text-white/30' : 'text-gray-300'}`} />
      </div>
    </div>
  );
};

const TrackItem: React.FC<{ item: SpotifyItem, isNight?: boolean, onImageLoad?: () => void }> = ({ item, isNight, onImageLoad }) => {
  const openSearch = () => {
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(item.title + ' ' + item.artist)}`;
    window.open(searchUrl, '_blank');
  };

  const handleClick = () => {
    // Always perform a search instead of direct play as per user request
    openSearch();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80`;
    onImageLoad?.();
  };

  const handleImageLoad = () => {
    onImageLoad?.();
  };

  const thumbUrl = item.thumbnail || `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80`;

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center gap-4 group cursor-pointer ${isNight ? 'active:bg-white/5' : 'active:bg-gray-50'} p-2 rounded-2xl transition-all select-none`}
    >
      <div className={`relative w-14 h-14 rounded-xl overflow-hidden shadow-sm shrink-0 border ${isNight ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-50'}`}>
        <img 
          src={thumbUrl} 
          alt={item.title} 
          loading="eager"
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-[14px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'} leading-tight truncate`}>
          {item.title}
        </h3>
        <p className={`text-[11px] ${isNight ? 'text-white/40' : 'text-gray-400'} font-bold mt-0.5`}>{item.artist}</p>
      </div>
    </div>
  );
};
