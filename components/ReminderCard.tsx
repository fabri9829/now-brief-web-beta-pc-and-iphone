import React from 'react';
import { TreePine, Dumbbell, Pill, Bell, Coffee, Book, Search, Clock } from 'lucide-react';

interface ReminderCardProps {
  title: string;
  text: string;
  icon: string;
  time: string;
  isNight?: boolean;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ title, text, icon, time, isNight }) => {
  const getIcon = () => {
    switch (icon) {
      case 'tree': return <TreePine className="w-6 h-6 text-green-500" />;
      case 'dumbbell': return <Dumbbell className="w-6 h-6 text-blue-500" />;
      case 'pill': return <Pill className="w-6 h-6 text-red-500" />;
      case 'bell': return <Bell className="w-6 h-6 text-yellow-500" />;
      case 'coffee': return <Coffee className="w-6 h-6 text-amber-600" />;
      case 'book': return <Book className="w-6 h-6 text-indigo-500" />;
      default: return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-top-4 duration-700">
      <div className={`mb-4 ${isNight ? 'bg-white/10 border-white/10' : 'bg-white border-white'} rounded-[24px] p-5 shadow-lg border`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${isNight ? 'bg-white/5' : 'bg-gray-50'} flex items-center justify-center shrink-0`}>
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-[16px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>{title}</h3>
              <div className="flex items-center gap-1 opacity-40">
                <Clock className={`w-3 h-3 ${isNight ? 'text-white' : 'text-black'}`} />
                <span className={`text-[11px] font-bold ${isNight ? 'text-white' : 'text-black'}`}>{time}</span>
              </div>
            </div>
            <p className={`text-[14px] font-medium leading-snug ${isNight ? 'text-white/60' : 'text-gray-500'}`}>
              {text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
