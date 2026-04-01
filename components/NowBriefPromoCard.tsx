import React from 'react';

interface NowBriefPromoCardProps {
  shimmerClass?: string;
  cardClass?: string;
  isNight?: boolean;
}

export const NowBriefPromoCard: React.FC<NowBriefPromoCardProps> = ({ shimmerClass = "", cardClass = "", isNight }) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="px-1">
        <p className={`text-[14px] font-medium ${isNight ? 'text-white/60' : 'text-black/80'} ${shimmerClass}`}>
          Conoce tu <span className={`${isNight ? 'text-blue-400' : 'text-blue-600'} cursor-pointer hover:underline`}>resumen del Now Brief</span>.
        </p>
      </div>
      
      <div className={`${isNight ? 'bg-white/10 border-white/10' : 'bg-[#f0f7ff] border-white/50'} rounded-[40px] p-5 flex items-center gap-5 shadow-sm border transition-colors duration-1000 ${cardClass}`}>
        <div className={`w-[100px] h-[100px] ${isNight ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} rounded-[28px] border flex items-center justify-center shrink-0 shadow-sm overflow-hidden`}>
          <svg width="60" height="85" viewBox="0 0 60 85" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="56" height="81" rx="8" fill={isNight ? "#1e293b" : "#f8fafc"} stroke={isNight ? "#ffffff" : "#1e293b"} strokeWidth="1.5" strokeOpacity={isNight ? 0.2 : 1}/>
            <rect x="6" y="15" width="48" height="15" rx="2" fill="#3b82f6" fillOpacity="0.1"/>
            <rect x="6" y="32" width="48" height="25" rx="4" fill="#3b82f6" fillOpacity="0.8"/>
            <circle cx="15" cy="38" r="3" fill="white" fillOpacity="0.5"/>
            <rect x="22" y="36" width="20" height="2" rx="1" fill="white" fillOpacity="0.5"/>
            <rect x="22" y="40" width="15" height="2" rx="1" fill="white" fillOpacity="0.5"/>
            <rect x="6" y="62" width="48" height="10" rx="2" fill={isNight ? "#334155" : "#e2e8f0"}/>
            <circle cx="45" cy="72" r="6" fill="#00f2fe"/>
            <path d="M43 72L45 74L47 70" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="6" y="8" width="20" height="2" rx="1" fill={isNight ? "#ffffff" : "#1e293b"} fillOpacity={isNight ? 0.4 : 0.8}/>
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className={`text-[20px] font-bold ${isNight ? 'text-white' : 'text-black'} leading-[1.2] tracking-tight ${shimmerClass}`}>
            Mantente al día con el resumen de Now Brief
          </h3>
        </div>
      </div>
    </div>
  );
};