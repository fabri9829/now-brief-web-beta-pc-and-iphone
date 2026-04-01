import React, { useRef } from 'react';
import { Sun, Cloud, CloudRain, Moon } from 'lucide-react';
import { WeatherData } from '../types';

const WeatherIcon = ({ condition, className = "" }: { condition?: string; className?: string }) => {
  const cond = (condition || 'clear').toLowerCase();
  if (cond.includes('sun') || cond.includes('clear')) return <Sun className={className} />;
  if (cond.includes('rain') || cond.includes('storm')) return <CloudRain className={className} />;
  if (cond.includes('moon') || cond.includes('night')) return <Moon className={className} />;
  return <Cloud className={className} />;
};

export const WeatherCard: React.FC<{ data: WeatherData, isNight?: boolean }> = ({ data, isNight }) => {
  const handleClick = () => {
    const searchUrl = `https://www.google.com/search?q=weather+in+${encodeURIComponent(data?.location || 'my+location')}`;
    // Always perform a search as per user request
    window.open(searchUrl, '_blank');
  };

  if (!data) return null;

  const forecast = data.forecast || [];

  return (
    <div 
      onClick={handleClick}
      className={`${isNight ? 'bg-[#1e293b] border-white/5' : 'bg-[#5c9ce6]'} rounded-[24px] p-5 w-full text-white shadow-lg overflow-hidden relative cursor-pointer active:scale-[0.98] transition-transform select-none flex flex-col justify-center border transition-colors duration-1000`}
    >
      {/* Hourly Forecast Row - Compact Rectangle */}
      <div className="w-full overflow-x-auto scrollbar-hide mb-4">
        {forecast.length > 0 ? (
          <div className="flex items-center justify-between gap-4 min-w-max px-1">
            {forecast.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[50px]">
                <span className="text-[10px] font-bold opacity-70 mb-2 uppercase tracking-tight">{item.time}</span>
                <WeatherIcon condition={item.icon} className="w-6 h-6 mb-2" />
                <span className="text-[14px] font-black">{item.temp}°</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-2 opacity-40 text-[12px] font-bold italic">
            Sincronizando el clima...
          </div>
        )}
      </div>

      {/* Divider and Summary Text */}
      <div className={`pt-4 border-t ${isNight ? 'border-white/10' : 'border-white/20'}`}>
        <p className="text-[15px] font-bold leading-tight mb-1">
          Ahora hace {data.temp}°C en {data.location}
        </p>
        <p className="text-[13px] font-medium opacity-80">
          {isNight ? (data.sunrise ? `Amanecer a las ${data.sunrise}` : 'Amanecer a las 6:00 AM') : (data.sunset ? `Atardecer a las ${data.sunset}` : 'Atardecer a las 6:00 PM')}
        </p>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </div>
  );
};