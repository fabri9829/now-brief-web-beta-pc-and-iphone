import React from 'react';
import { ChevronLeft, RotateCw, Loader2, Volume2, Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';

interface SummaryViewProps {
  onBack: () => void;
  summaryLoading: boolean;
  summaryPhase: number;
  loadingPhrases: string[];
  generatedSummary: string;
  summaryDataReady: boolean;
  isTtsActive: boolean;
  isTtsPlaying: boolean;
  isTtsLoading: boolean;
  onReadSummary: () => void;
  onStopTts: () => void;
  onSkipAudio: (direction: 'forward' | 'backward') => void;
  onRefresh?: () => void;
  isNight?: boolean;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  onBack,
  summaryLoading,
  summaryPhase,
  loadingPhrases,
  generatedSummary,
  summaryDataReady,
  isTtsActive,
  isTtsPlaying,
  isTtsLoading,
  onReadSummary,
  onStopTts,
  onSkipAudio,
  onRefresh,
  isNight
}) => {
  return (
    <div className={`fixed inset-0 ${isNight ? 'bg-[#0f172a]' : 'bg-[#f2f2f7]'} z-[1500] flex flex-col animate-in fade-in duration-500 overflow-hidden transition-colors duration-1000`}>
      <div className={`absolute inset-0 ${isNight ? 'bg-gradient-to-br from-blue-900/20 via-transparent to-teal-900/20' : 'bg-gradient-to-br from-blue-50/50 via-transparent to-teal-50/50'} pointer-events-none`} />
      
      <div className="p-8 flex items-center justify-between relative z-10">
        <button 
          onClick={onBack}
          className={`p-3 ${isNight ? 'bg-white/10 text-white' : 'bg-white text-[#0f172a]'} rounded-full shadow-sm hover:shadow-md transition-all active:scale-95`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isNight ? 'bg-blue-400' : 'bg-blue-600'} animate-pulse`} />
          <span className={`text-[13px] font-black ${isNight ? 'text-white' : 'text-[#0f172a]'} uppercase tracking-[0.2em]`}>Síntesis de Galaxy AI</span>
        </div>
        <button 
          onClick={onRefresh}
          className={`p-3 ${isNight ? 'bg-white/10 text-white' : 'bg-white text-[#0f172a]'} rounded-full shadow-sm hover:shadow-md transition-all active:scale-95`}
        >
          <RotateCw className={`w-6 h-6 ${summaryLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 px-8 flex flex-col items-center justify-center relative z-10 max-w-lg mx-auto w-full">
        {summaryLoading ? (
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className={`w-24 h-24 rounded-[32px] ${isNight ? 'bg-white/10' : 'bg-white'} shadow-xl flex items-center justify-center animate-pulse`}>
                <RotateCw className={`w-10 h-10 ${isNight ? 'text-blue-400' : 'text-blue-600'} animate-spin duration-[3000ms]`} />
              </div>
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${isNight ? 'bg-blue-500' : 'bg-blue-600'} flex items-center justify-center shadow-lg animate-bounce`}>
                <span className="text-[10px] font-black text-white">AI</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className={`text-[28px] font-black ${isNight ? 'text-white' : 'text-[#0f172a]'} tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                {loadingPhrases[summaryPhase]}...
              </h2>
              <p className={`text-[15px] ${isNight ? 'text-white/40' : 'text-[#0f172a]/40'} font-bold uppercase tracking-widest`}>
                Procesando datos en tiempo real
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className={`p-10 ${isNight ? 'bg-white/10 border-white/10' : 'bg-white border-white'} rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border relative overflow-hidden group`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-teal-400 to-blue-600" />
              
              <p className={`text-[22px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'} leading-relaxed tracking-tight`}>
                {generatedSummary}
              </p>
              
              <div className={`mt-10 flex items-center justify-between pt-8 border-t ${isNight ? 'border-white/5' : 'border-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${isNight ? 'bg-blue-500/10' : 'bg-blue-50'} flex items-center justify-center`}>
                    <RotateCw className={`w-5 h-5 ${isNight ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-black ${isNight ? 'text-white/40' : 'text-[#0f172a]/40'} uppercase tracking-widest`}>Estado</span>
                    <span className={`text-[13px] font-black ${isNight ? 'text-blue-400' : 'text-blue-600'}`}>Verificado por Galaxy AI</span>
                  </div>
                </div>
                
                <button 
                  onClick={onReadSummary}
                  disabled={isTtsLoading}
                  className={`p-5 rounded-full shadow-lg transition-all active:scale-90 ${isTtsActive ? 'bg-blue-600 text-white' : (isNight ? 'bg-white text-black' : 'bg-[#0f172a] text-white hover:shadow-xl')}`}
                >
                  {isTtsLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isTtsActive ? (
                    isTtsPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {isTtsActive && (
              <div className="flex items-center justify-center gap-8 animate-in fade-in zoom-in duration-500">
                <button onClick={() => onSkipAudio('backward')} className={`p-4 ${isNight ? 'bg-white/10 text-white' : 'bg-white text-[#0f172a]'} rounded-full shadow-sm active:scale-90 transition-all`}>
                  <SkipBack className="w-6 h-6" />
                </button>
                <button onClick={onStopTts} className={`p-4 ${isNight ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-full shadow-sm active:scale-90 transition-all`}>
                  <X className="w-6 h-6" />
                </button>
                <button onClick={() => onSkipAudio('forward')} className={`p-4 ${isNight ? 'bg-white/10 text-white' : 'bg-white text-[#0f172a]'} rounded-full shadow-sm active:scale-90 transition-all`}>
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className={`p-12 flex justify-center relative z-10 ${isNight ? 'opacity-40' : 'opacity-20'}`}>
        <p className={`text-[11px] ${isNight ? 'text-white' : 'text-[#0f172a]'} font-black uppercase tracking-[0.3em]`}>Síntesis de Galaxy AI • 2026</p>
      </div>
    </div>
  );
};
