import React from 'react';
import { Calendar, Clock, Info } from 'lucide-react';
import { OccasionData } from '../types';

interface OccasionCardProps {
  occasion: OccasionData;
  isNight?: boolean;
  shimmerClass?: string;
  cardClass?: string;
}

export const OccasionCard: React.FC<OccasionCardProps> = ({ occasion, isNight, shimmerClass = "", cardClass = "" }) => {
  if (!occasion || !occasion.isOccasion) return null;

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="px-1">
        <p className={`text-[14px] font-medium ${isNight ? 'text-white/60' : 'text-black/80'} ${shimmerClass}`}>
          <span className={`${isNight ? 'text-amber-400' : 'text-amber-600'}`}>Ocasión especial</span> de hoy
        </p>
      </div>
      
      <div className={`${isNight ? 'bg-white/10 border-white/10 text-white' : 'bg-amber-50 border-amber-200'} rounded-[40px] p-6 flex flex-col gap-4 shadow-sm border transition-all duration-1000 ${cardClass}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className={`text-[24px] font-bold ${isNight ? 'text-white' : 'text-amber-900'} leading-tight tracking-tight mb-2 ${shimmerClass}`}>
              {occasion.name}
            </h3>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium ${isNight ? 'bg-white/10 text-white/80' : 'bg-amber-100 text-amber-800'}`}>
                <Calendar size={14} />
                {occasion.date}
              </div>
              {occasion.time && (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium ${isNight ? 'bg-white/10 text-white/80' : 'bg-amber-100 text-amber-800'}`}>
                  <Clock size={14} />
                  {occasion.time}
                </div>
              )}
            </div>
          </div>
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isNight ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-200 text-amber-700'}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {occasion.description && (
          <div className={`mt-2 p-4 rounded-3xl text-[15px] leading-relaxed ${isNight ? 'bg-black/20 text-white/70' : 'bg-white/60 text-amber-900/80'}`}>
            <div className="flex gap-2">
              <Info size={18} className="shrink-0 mt-0.5 opacity-60" />
              <p>{occasion.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
