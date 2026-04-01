import React, { useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { NewsArticle } from '../types';

export const NewsCard: React.FC<{ news: NewsArticle[], isNight?: boolean, onImageLoad?: () => void }> = ({ news, isNight, onImageLoad }) => {
  return (
    <div className={`${isNight ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-gray-100'} rounded-[28px] p-6 w-full shadow-sm border transition-colors duration-1000`}>
      <div className="space-y-6">
        {news && news.length > 0 ? (
          news.map((item, idx) => (
            <NewsItem key={idx} item={item} isNight={isNight} onImageLoad={onImageLoad} />
          ))
        ) : (
          <p className={`text-[13px] ${isNight ? 'text-white/40' : 'text-gray-400'} py-4 text-center`}>No se encontraron noticias recientes para esta región.</p>
        )}
      </div>

      <div className={`flex justify-end gap-3 mt-4 pt-4 border-t ${isNight ? 'border-white/5' : 'border-gray-50'} items-center`}>
        <span className={`text-[10px] ${isNight ? 'text-white/40' : 'text-gray-400'} font-bold tracking-tight uppercase`}>Toca para ver la fuente</span>
        <Info className={`w-3.5 h-3.5 ${isNight ? 'text-white/30' : 'text-gray-300'}`} />
      </div>
    </div>
  );
};

const NewsItem: React.FC<{ item: NewsArticle, isNight?: boolean, onImageLoad?: () => void }> = ({ item, isNight, onImageLoad }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const openSearch = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title + ' ' + item.source)}`;
    window.open(searchUrl, '_blank');
  };

  const openDirect = () => {
    // Always perform a search instead of direct link as per user request
    openSearch();
  };

  const handleMouseDown = () => {
    setIsLongPressing(false);
    timerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      openSearch();
    }, 1500);
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
    openDirect();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80`;
    onImageLoad?.();
  };

  const handleImageLoad = () => {
    onImageLoad?.();
  };

  const imageUrl = item.imageUrl && item.imageUrl.startsWith('http') 
    ? item.imageUrl 
    : `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80`;

  return (
    <div 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onClick={handleClick}
      className={`flex gap-4 items-center py-1 cursor-pointer ${isNight ? 'active:bg-white/5' : 'active:bg-gray-50'} rounded-xl transition-all select-none group`}
    >
      <div className={`w-[100px] h-[75px] rounded-2xl overflow-hidden ${isNight ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-100'} shrink-0 border shadow-sm`}>
         <img 
          src={imageUrl} 
          alt="" 
          loading="eager"
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
         />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-[14px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'} leading-[1.3] line-clamp-2 tracking-tight`}>
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[11px] ${isNight ? 'text-blue-400' : 'text-blue-600'} font-bold tracking-tight`}>{item.source}</span>
          <div className={`w-1 h-1 rounded-full ${isNight ? 'bg-white/20' : 'bg-gray-200'}`} />
          <span className={`text-[11px] ${isNight ? 'text-white/40' : 'text-gray-400'} font-medium`}>{item.category}</span>
        </div>
      </div>
    </div>
  );
};