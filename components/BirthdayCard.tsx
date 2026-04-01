import React from 'react';
import { Cake, PartyPopper, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface BirthdayCardProps {
  name: string;
  isNight?: boolean;
}

export const BirthdayCard: React.FC<BirthdayCardProps> = ({ name, isNight }) => {
  return (
    <div className="relative w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`${isNight ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 text-white' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'} rounded-[28px] p-8 w-full shadow-lg border relative overflow-hidden group`}
      >
        {/* Background Sparkles */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <Sparkles className="absolute top-4 left-4 w-6 h-6 text-indigo-400 animate-pulse" />
          <Sparkles className="absolute bottom-4 right-4 w-6 h-6 text-purple-400 animate-pulse delay-700" />
          <Sparkles className="absolute top-1/2 right-8 w-4 h-4 text-pink-400 animate-pulse delay-300" />
        </div>

        <div className="flex flex-col items-center text-center gap-4 relative z-10">
          <div className={`w-20 h-20 rounded-full ${isNight ? 'bg-white/10' : 'bg-white'} flex items-center justify-center shadow-xl mb-2 group-hover:scale-110 transition-transform duration-500`}>
            <Cake className="w-10 h-10 text-indigo-500" />
          </div>
          
          <div className="space-y-1">
            <h2 className={`text-[28px] font-black ${isNight ? 'text-white' : 'text-[#0f172a]'} tracking-tight leading-tight`}>
              ¡Feliz cumpleaños, <span className="text-indigo-600">{name}</span>! 🎊
            </h2>
            <p className={`text-[15px] ${isNight ? 'text-white/60' : 'text-gray-500'} font-medium max-w-[240px] mx-auto`}>
              Galaxy AI está celebrando contigo hoy. ¡Que tengas un día maravilloso!
            </p>
          </div>

          <div className="flex gap-2 mt-2">
             <div className={`px-4 py-2 rounded-full ${isNight ? 'bg-white/5' : 'bg-white'} border ${isNight ? 'border-white/10' : 'border-indigo-100'} flex items-center gap-2 shadow-sm`}>
                <PartyPopper className="w-4 h-4 text-pink-500" />
                <span className={`text-[12px] font-bold ${isNight ? 'text-white/80' : 'text-indigo-900'}`}>Día especial</span>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
