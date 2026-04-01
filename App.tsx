import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimePhase, BriefContent, ReminderConfig, AppMode } from './types';
import { getBriefingContent, getMockBriefingContent, generateLabsSummary, generateTTS } from './geminiService';
import { WeatherCard } from './components/WeatherCard';
import { YoutubeCard } from './components/YoutubeCard';
import { NewsCard } from './components/NewsCard';
import { SpotifyCard } from './components/SpotifyCard';
import { NowBriefPromoCard } from './components/NowBriefPromoCard';
import { OccasionCard } from './components/OccasionCard';
import { BirthdayCard } from './components/BirthdayCard';
import { ReminderCard } from './components/ReminderCard';
import { FullScreenConfetti } from './components/FullScreenConfetti';
import { SettingsModal } from './components/SettingsModal';
import { SummaryView } from './components/SummaryView';
import { AlertCircle, AlertTriangle, Settings, ChevronLeft, Sun, Youtube, Newspaper, RotateCw, Lightbulb, ChevronRight, Info, FlaskConical, EyeOff, Music, X, Volume2, Play, Pause, SkipBack, SkipForward, Loader2, Check, Cake } from 'lucide-react';

const STORAGE_KEY = 'now_brief_config_v11';
const MANUAL_LOCATION_KEY = 'now_brief_manual_location_v1';
const PERMISSION_GRANTED_KEY = 'now_brief_permission_granted_v1';
const LABS_UNLOCKED_KEY = 'now_brief_labs_unlocked';
const LABS_ENABLED_KEY = 'now_brief_labs_enabled';
const AUDIO_SUMMARY_LABS_KEY = 'now_brief_audio_summary_labs';
const AUDIO_BRIEF_ENABLED_KEY = 'now_brief_audio_brief_enabled';
const AUDIO_VOICE_KEY = 'now_brief_audio_voice_v1';
const FLUID_ANIMATIONS_KEY = 'now_brief_fluid_animations';
const LIQUID_GLASS_PRO_KEY = 'now_brief_liquid_glass_pro';
const SMART_SUMMARY_KEY = 'now_brief_smart_summary';
const DYNAMIC_THEMES_KEY = 'now_brief_dynamic_themes';
const AMBIENT_SOUNDS_KEY = 'now_brief_ambient_sounds';
const APP_MODE_KEY = 'now_brief_app_mode_v1';
const BIRTHDAY_CONFIG_KEY = 'now_brief_birthday_config_v1';
const REMINDERS_KEY = 'now_brief_reminders_v1';
const CACHED_BRIEF_KEY = 'now_brief_cached_data_v1';
const CACHED_SUMMARY_KEY = 'now_brief_cached_summary_v1';
const CACHE_TTL = 1 * 60 * 1000; // 1 minute cache

type SettingsView = 'home' | 'customize' | 'about' | 'labs' | 'credits' | 'reminders';
type MainView = 'brief' | 'summary';

const GalaxyAiLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3ebbd2" />
        <stop offset="100%" stopColor="#2575fc" />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path d="M58 21C58 21 61 40 82 48C61 56 58 75 58 75C58 75 55 56 34 48C55 40 58 21 58 21Z" fill="url(#grad1)" />
    <path d="M31 36C31 36 33 50 48 56C33 62 31 76 31 76C31 76 29 62 14 56C29 50 31 36 31 36Z" fill="url(#grad2)" />
    <path d="M36 13C36 13 37 23 44 27C37 31 36 41 36 41C36 41 35 31 28 27C35 23 36 13 36 13Z" fill="url(#grad2)" />
    <path d="M75 68C75 68 76 75 81 78C76 81 75 88 75 88C75 88 74 81 69 78C74 75 75 68 75 68Z" fill="url(#grad1)" />
  </svg>
);

const WaveformIcon = () => (
  <div className="flex items-center gap-[1.5px]">
    <div className="w-[1.5px] h-1 bg-black rounded-full" />
    <div className="w-[1.5px] h-2.5 bg-black rounded-full" />
    <div className="w-[1.5px] h-1.5 bg-black rounded-full" />
    <div className="w-[1.5px] h-2.5 bg-black rounded-full" />
    <div className="w-[1.5px] h-1 bg-black rounded-full" />
  </div>
);

const LOADING_PHRASES = [
  "Sintetizando actualizaciones",
  "Refinando tu resumen",
  "Galaxy AI está concluyendo",
  "Finalizando tu resumen"
];

const App: React.FC = () => {
  const [phase, setPhase] = useState<TimePhase>(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return TimePhase.MORNING;
    if (hour >= 12 && hour < 17) return TimePhase.DAY;
    if (hour >= 17 && hour < 20) return TimePhase.EVENING;
    return TimePhase.LATE_NIGHT;
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      let newPhase = TimePhase.LATE_NIGHT;
      if (hour >= 5 && hour < 12) newPhase = TimePhase.MORNING;
      else if (hour >= 12 && hour < 17) newPhase = TimePhase.DAY;
      else if (hour >= 17 && hour < 20) newPhase = TimePhase.EVENING;
      
      if (newPhase !== phase) {
        setPhase(newPhase);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [phase]);

  const isNight = phase === TimePhase.LATE_NIGHT;
  const [content, setContent] = useState<BriefContent | null>(() => getMockBriefingContent(phase));
  
  // Update phase when content is fetched to match local time of location
  useEffect(() => {
    if (content?.localHour !== undefined) {
      const hour = content.localHour;
      let newPhase = TimePhase.LATE_NIGHT;
      if (hour >= 5 && hour < 12) newPhase = TimePhase.MORNING;
      else if (hour >= 12 && hour < 17) newPhase = TimePhase.DAY;
      else if (hour >= 17 && hour < 20) newPhase = TimePhase.EVENING;
      
      if (newPhase !== phase) {
        setPhase(newPhase);
      }
    }
  }, [content, phase]);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const [totalImagesToLoad, setTotalImagesToLoad] = useState(0);
  
  const handleImageLoad = useCallback(() => {
    setImagesLoadedCount(prev => prev + 1);
  }, []);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsView, setSettingsView] = useState<SettingsView>('home');
  const [mainView, setMainView] = useState<MainView>('brief');
  const [showRefreshPopup, setShowRefreshPopup] = useState<boolean>(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [manualLocation, setManualLocation] = useState(() => localStorage.getItem(MANUAL_LOCATION_KEY) || '');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(() => localStorage.getItem(PERMISSION_GRANTED_KEY) !== 'true');
  
  const [labsUnlocked, setLabsUnlocked] = useState(() => localStorage.getItem(LABS_UNLOCKED_KEY) === 'true');
  const [labsEnabled, setLabsEnabled] = useState(() => localStorage.getItem(LABS_ENABLED_KEY) === 'true');
  const [audioSummaryLabsEnabled, setAudioSummaryLabsEnabled] = useState(() => localStorage.getItem(AUDIO_SUMMARY_LABS_KEY) === 'true');
  const [audioBriefEnabled, setAudioBriefEnabled] = useState(() => localStorage.getItem(AUDIO_BRIEF_ENABLED_KEY) !== 'false');
  const [selectedVoice, setSelectedVoice] = useState<string>(() => localStorage.getItem(AUDIO_VOICE_KEY) || 'Zephyr');
  
  // Experimental Features
  const [fluidAnimations, setFluidAnimations] = useState(() => localStorage.getItem(FLUID_ANIMATIONS_KEY) === 'true');
  const [liquidGlassPro, setLiquidGlassPro] = useState(() => localStorage.getItem(LIQUID_GLASS_PRO_KEY) === 'true');
  const [smartSummary, setSmartSummary] = useState(() => localStorage.getItem(SMART_SUMMARY_KEY) === 'true');
  const [dynamicThemes, setDynamicThemes] = useState(() => localStorage.getItem(DYNAMIC_THEMES_KEY) === 'true');
  const [ambientSounds, setAmbientSounds] = useState(() => localStorage.getItem(AMBIENT_SOUNDS_KEY) === 'true');

  useEffect(() => {
    if (!dynamicThemes) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dynamicThemes]);

  const [appMode, setAppMode] = useState<AppMode>('mobile');
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const handleResize = () => {
      // Automatic switching: PC/Tablet if width >= 768px
      const isLarge = window.innerWidth >= 768;
      setAppMode(isLarge ? 'pc' : 'mobile');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const [birthdayConfig, setBirthdayConfig] = useState(() => {
    const saved = localStorage.getItem(BIRTHDAY_CONFIG_KEY);
    return saved ? JSON.parse(saved) : { enabled: false, name: '', date: '' };
  });

  const [reminders, setReminders] = useState<ReminderConfig[]>(() => {
    const saved = localStorage.getItem(REMINDERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const handleUpdateBirthday = (updates: any) => {
    const newConfig = { ...birthdayConfig, ...updates };
    setBirthdayConfig(newConfig);
    localStorage.setItem(BIRTHDAY_CONFIG_KEY, JSON.stringify(newConfig));
  };

  const handleUpdateReminders = (newReminders: ReminderConfig[]) => {
    setReminders(newReminders);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(newReminders));
  };

  const isBirthdayToday = useCallback(() => {
    if (!birthdayConfig.enabled || !birthdayConfig.date) return false;
    const today = new Date();
    const [year, month, day] = birthdayConfig.date.split('-').map(Number);
    return today.getMonth() === (month - 1) && today.getDate() === day;
  }, [birthdayConfig]);

  const getActiveReminders = useCallback(() => {
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    return reminders.filter(reminder => {
      if (!reminder.enabled) return false;
      const [hour, minute] = reminder.time.split(':').map(Number);
      return hour === currentHour && minute === currentMinute;
    });
  }, [reminders, currentTime]);

  const [showLabsToast, setShowLabsToast] = useState(false);
  const [showDevCodePopup, setShowDevCodePopup] = useState(false);
  const [devCodeInput, setDevCodeInput] = useState('');
  const [devCodeTarget, setDevCodeTarget] = useState<'labs' | 'audioSummary'>('labs');
  const [showTtsError, setShowTtsError] = useState(false);
  const [ttsErrorMessage, setTtsErrorMessage] = useState('');
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  
  // TTS State
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [isTtsActive, setIsTtsActive] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleAudioBrief = () => {
    const newState = !audioBriefEnabled;
    setAudioBriefEnabled(newState);
    localStorage.setItem(AUDIO_BRIEF_ENABLED_KEY, String(newState));
  };

  const handleSelectVoice = async (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem(AUDIO_VOICE_KEY, voice);

    // Stop current audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      setIsTtsActive(false);
      setIsTtsPlaying(false);
    }

    try {
    const previewText = `Hola, soy ${voice}. ¿Quieres seleccionarme como tu voz para el resumen de audio?`;
      const base64Audio = await generateTTS(previewText, voice);
      
      if (base64Audio) {
        const cleanBase64 = base64Audio.replace(/\s/g, '');
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(audioUrl);
        await audio.play();
      }
    } catch (error) {
      console.error("Preview TTS Error:", error);
    }
  };

  const handleReadBrief = async () => {
    if (!content || !audioBriefEnabled) return;
    
    if (isTtsActive) {
      if (audioRef.current) {
        if (isTtsPlaying) {
          audioRef.current.pause();
          setIsTtsPlaying(false);
        } else {
          audioRef.current.play().catch(e => console.error("Playback error:", e));
          setIsTtsPlaying(true);
        }
      }
      return;
    }

    setIsTtsLoading(true);
    
    // Construct text to read
    const textToRead = content ? `
      ${content.greeting}. ${content.subtext}. 
      Aquí tienes el clima para hoy en ${content.weather.location}. La temperatura en tu ubicación actual es de ${content.weather.temp} grados centígrados. ${content.weather.comparison}.
      ${activeVisibility.youtube && content.youtubeUploads?.length > 0 ? "¡Aquí tienes algunos videos de YouTube que podrías querer ver!" : ""}
      ${activeVisibility.spotify && content.spotifyItems?.length > 0 ? "¡Aquí tienes una lista de reproducción de Spotify para ti!" : ""}
      ${activeVisibility.news && content.news?.length > 0 ? "¡Aquí tienes las últimas noticias solo para ti!" : ""}
    `.trim() : "";

    try {
      if (!textToRead) throw new Error("No content to read");

      const base64Audio = await generateTTS(textToRead, selectedVoice);
      
      if (base64Audio) {
        // Clean the base64 string and convert to Blob for more reliable playback
        const cleanBase64 = base64Audio.replace(/\s/g, '');
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => {
          setIsTtsActive(true);
          setIsTtsPlaying(true);
          setIsTtsLoading(false);
        };

        audio.onended = () => {
          setIsTtsActive(false);
          setIsTtsPlaying(false);
          URL.revokeObjectURL(audioUrl); // Clean up
          if (audioSummaryLabsEnabled) {
            setShowSummaryPrompt(true);
            setTimeout(() => setShowSummaryPrompt(false), 8000); // Hide after 8s
          }
        };
        
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setIsTtsActive(false);
          setIsTtsPlaying(false);
          setIsTtsLoading(false);
          URL.revokeObjectURL(audioUrl); // Clean up
        };

        await audio.play();
      } else {
        throw new Error("Failed to generate audio");
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      setIsTtsLoading(false);
      
      // Fallback to browser TTS for the ACTUAL BRIEF CONTENT as requested
      setIsTtsActive(true);
      setIsTtsPlaying(true);
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => {
        setIsTtsActive(false);
        setIsTtsPlaying(false);
        if (audioSummaryLabsEnabled) {
          setShowSummaryPrompt(true);
          setTimeout(() => setShowSummaryPrompt(false), 8000);
        }
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const skipAudio = (direction: 'forward' | 'backward') => {
    if (audioRef.current) {
      const skipTime = direction === 'forward' ? 2 : 5; // 2s for "one word ahead", 5s for backward
      const newTime = direction === 'forward' 
        ? Math.min(audioRef.current.duration, audioRef.current.currentTime + skipTime)
        : Math.max(0, audioRef.current.currentTime - skipTime);
      audioRef.current.currentTime = newTime;
    }
  };

  const stopTts = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsTtsActive(false);
    setIsTtsPlaying(false);
  };

  const handleReadSummary = async () => {
    setShowSummaryPrompt(false);
    setMainView('summary');
    
    if (isTtsActive) {
      if (audioRef.current) {
        if (isTtsPlaying) {
          audioRef.current.pause();
          setIsTtsPlaying(false);
        } else {
          audioRef.current.play().catch(e => console.error("Playback error:", e));
          setIsTtsPlaying(true);
        }
      }
      return;
    }

    // If summary is not ready, wait or trigger it
    if (!summaryDataReady && !summaryLoading) {
      await triggerGenerateSummary(false);
    }
    
    // Wait for summary text to be available
    let summaryText = generatedSummary;
    if (!summaryText && summaryLoading) {
      // Poll briefly for summary
      let attempts = 0;
      while (!generatedSummary && attempts < 20) {
        await new Promise(r => setTimeout(r, 500));
        attempts++;
      }
      summaryText = generatedSummary;
    }

    if (!summaryText) return;

    setIsTtsLoading(true);
    try {
      const base64Audio = await generateTTS(summaryText, selectedVoice);
      if (base64Audio) {
        const cleanBase64 = base64Audio.replace(/\s/g, '');
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onplay = () => {
          setIsTtsActive(true);
          setIsTtsPlaying(true);
          setIsTtsLoading(false);
        };

        audio.onended = () => {
          setIsTtsActive(false);
          setIsTtsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error("Summary TTS Error:", error);
      setIsTtsLoading(false);
    }
  };
  const [versionClickCount, setVersionClickCount] = useState(0);
  
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryPhase, setSummaryPhase] = useState(0);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [summaryDataReady, setSummaryDataReady] = useState(false);

  const [pendingVisibility, setPendingVisibility] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { weather: true, youtube: true, spotify: true, news: true };
  });

  const [activeVisibility, setActiveVisibility] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { weather: true, youtube: true, spotify: true, news: true };
  });

  const initialized = useRef(false);

  const calculatePhase = useCallback((hourOverride?: number) => {
    const hour = hourOverride !== undefined ? hourOverride : new Date().getHours();
    if (hour >= 5 && hour < 12) return TimePhase.MORNING;
    if (hour >= 12 && hour < 17) return TimePhase.DAY;
    if (hour >= 17 && hour < 20) return TimePhase.EVENING;
    return TimePhase.LATE_NIGHT; 
  }, []);

  const triggerGenerateSummary = useCallback(async (force = false, currentContent: BriefContent | null = null) => {
    if (summaryLoading && !force) return;
    
    if (!force) {
      const cached = localStorage.getItem(CACHED_SUMMARY_KEY);
      if (cached) {
        const { summary, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setGeneratedSummary(summary);
          setSummaryDataReady(true);
          return;
        }
      }
    }

    setSummaryLoading(true);
    setSummaryDataReady(false);
    setSummaryPhase(0);

    try {
      const targetContent = currentContent || content;
      const summary = await generateLabsSummary(targetContent, location?.lat, location?.lng);
      setGeneratedSummary(summary);
      setSummaryDataReady(true);
      if (summary && !summary.includes('quota') && !summary.includes('wrong')) {
        localStorage.setItem(CACHED_SUMMARY_KEY, JSON.stringify({ summary, timestamp: Date.now() }));
      }
    } catch (err) {
      setGeneratedSummary("No se pudo contactar con Galaxy AI para la síntesis en tiempo real.");
      setSummaryDataReady(true);
    }
  }, [location, content, summaryLoading]);

  const runInitialization = useCallback(async (lat?: number, lng?: number, force = false) => {
    setIsGenerating(true);
    setIsFinishing(false);
    setShowRefreshPopup(false);
    setImagesLoadedCount(0);
    setTotalImagesToLoad(0);
    
    const savedManual = localStorage.getItem(MANUAL_LOCATION_KEY);
    
    if (lat && lng) setLocation({lat, lng});
    
    const startTime = Date.now();
    setActiveVisibility({...pendingVisibility});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingVisibility));
    
    const phase = calculatePhase();
    
    if (!force) {
      const cached = localStorage.getItem(CACHED_BRIEF_KEY);
      if (cached) {
        const { data, timestamp, phase: cachedPhase } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL && cachedPhase === phase) {
          setContent(data);
          
          // Calculate images to load from cache
          let count = 0;
          if (data.youtubeUploads) count += data.youtubeUploads.length;
          if (data.spotifyItems) count += data.spotifyItems.length;
          if (data.news) count += data.news.length;
          setTotalImagesToLoad(count);
          
          if (count === 0) {
            setIsGenerating(false);
          }
          
          if (localStorage.getItem(LABS_ENABLED_KEY) === 'true') {
            triggerGenerateSummary(false, data);
          }
          return;
        }
      }
    }

    try {
      const data = await getBriefingContent(phase, lat, lng, savedManual || undefined);
      
      // Calculate images to load
      let count = 0;
      if (data.youtubeUploads) count += data.youtubeUploads.length;
      if (data.spotifyItems) count += data.spotifyItems.length;
      if (data.news) count += data.news.length;
      setTotalImagesToLoad(count);

      // If the model returned a local hour, check if the phase should be different
      if (data.localHour !== undefined) {
        const actualPhase = calculatePhase(data.localHour);
        if (actualPhase !== phase) {
          setPhase(actualPhase);
        }
      }

      setContent(data);
      localStorage.setItem(CACHED_BRIEF_KEY, JSON.stringify({ data, timestamp: Date.now(), phase }));
      if (localStorage.getItem(LABS_ENABLED_KEY) === 'true') {
        triggerGenerateSummary(false, data);
      }
      
      // If no images to load, we can finish immediately after minimum animation
      if (count === 0) {
        const elapsed = Date.now() - startTime;
        const totalAnimationTime = 1200; 
        const remaining = Math.max(0, totalAnimationTime - elapsed);
        
        setTimeout(() => {
          setIsFinishing(true);
          setTimeout(() => {
            setIsGenerating(false);
          }, 800);
        }, remaining);
      }
    } catch (err: any) {
      const mockData = getMockBriefingContent(phase);
      setContent(mockData);
      
      let count = 0;
      if (mockData.youtubeUploads) count += mockData.youtubeUploads.length;
      if (mockData.spotifyItems) count += mockData.spotifyItems.length;
      if (mockData.news) count += mockData.news.length;
      setTotalImagesToLoad(count);
    }
  }, [calculatePhase, pendingVisibility, triggerGenerateSummary]);

  // Effect to handle finishing when all images are loaded
  useEffect(() => {
    if (isGenerating && !isFinishing && totalImagesToLoad > 0 && imagesLoadedCount >= totalImagesToLoad) {
      setIsFinishing(true);
      setTimeout(() => {
        setIsGenerating(false);
      }, 800);
    }
  }, [isGenerating, isFinishing, imagesLoadedCount, totalImagesToLoad]);

  const fetchIpLocation = useCallback(async () => {
    // Try ipapi.co first
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        runInitialization(data.latitude, data.longitude);
        return true;
      }
    } catch (e) {
      console.error("IPapi Fallback Failed:", e);
    }

    // Try ip-api.com as second fallback
    try {
      const response = await fetch('http://ip-api.com/json/');
      const data = await response.json();
      if (data.lat && data.lon) {
        runInitialization(data.lat, data.lon);
        return true;
      }
    } catch (e) {
      console.error("IP-API Fallback Failed:", e);
    }

    // Try freeipapi.com as third fallback
    try {
      const response = await fetch('https://freeipapi.com/api/json');
      const data = await response.json();
      if (data.latitude && data.longitude) {
        runInitialization(data.latitude, data.longitude);
        return true;
      }
    } catch (e) {
      console.error("FreeIPAPI Fallback Failed:", e);
    }
    return false;
  }, [runInitialization]);

  const handleGrantPermission = () => {
    localStorage.setItem(PERMISSION_GRANTED_KEY, 'true');
    setNeedsPermission(false);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => runInitialization(pos.coords.latitude, pos.coords.longitude),
        async () => {
          const success = await fetchIpLocation();
          if (!success) runInitialization();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      fetchIpLocation().then(success => {
        if (!success) runInitialization();
      });
    }
  };

  useEffect(() => {
    if (initialized.current || needsPermission) return;
    initialized.current = true;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => runInitialization(pos.coords.latitude, pos.coords.longitude),
        async () => {
          const success = await fetchIpLocation();
          if (!success) runInitialization();
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      fetchIpLocation().then(success => {
        if (!success) runInitialization();
      });
    }
  }, [runInitialization, fetchIpLocation, needsPermission]);

  const handleSaveManualLocation = () => {
    localStorage.setItem(MANUAL_LOCATION_KEY, manualLocation);
    setIsEditingLocation(false);
    setShowRefreshPopup(true);
  };

  const toggleVisibility = (key: keyof typeof pendingVisibility) => {
    const newVal = !pendingVisibility[key];
    setPendingVisibility((prev: any) => ({ ...prev, [key]: newVal }));
    setActiveVisibility((prev: any) => ({ ...prev, [key]: newVal }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...pendingVisibility, [key]: newVal }));
  };

  const getShimmerClass = (type: 'text' | 'subtext') => {
    if (!isGenerating && !isFinishing) return '';
    
    if (isFinishing) {
      if (isNight) {
        return type === 'text' ? 'text-shimmer-finished-night' : 'subtext-shimmer-finished-night';
      }
      return type === 'text' ? 'text-shimmer-finished' : 'subtext-shimmer-finished';
    }
    
    if (isNight) {
      return `shimmer-text-base ${type === 'text' ? 'text-shimmer-night' : 'subtext-shimmer-night'}`;
    }
    return `shimmer-text-base ${type === 'text' ? 'text-shimmer' : 'subtext-shimmer'}`;
  };

  const TABS = [
    { id: 'all', label: 'Todo', icon: <RotateCw className="w-5 h-5" /> },
    { id: 'weather', label: 'Clima', icon: <Sun className="w-5 h-5" /> },
    { id: 'news', label: 'Noticias', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'media', label: 'Media', icon: <Youtube className="w-5 h-5" /> },
  ];

  const getBackgroundClass = () => {
    let baseClass = '';
    switch (phase) {
      case TimePhase.MORNING: baseClass = 'bg-morning'; break;
      case TimePhase.DAY: baseClass = 'bg-day'; break;
      case TimePhase.EVENING: baseClass = 'bg-evening'; break;
      case TimePhase.LATE_NIGHT: baseClass = 'bg-night'; break;
      default: baseClass = 'bg-morning';
    }
    
    if (dynamicThemes) {
      baseClass += ' dynamic-theme-active';
    }
    
    return baseClass;
  };

  const getCardClass = () => {
    let classes = "";
    if (isGenerating || isFinishing) {
      classes += "shimmer-active" + (isFinishing ? " shimmer-finishing" : "");
    }
    
    if (liquidGlassPro) {
      classes += " liquid-glass-card";
    }
    
    return classes;
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    setSettingsView('home');
  };

  const handleVersionClick = () => {
    const nextCount = versionClickCount + 1;
    setVersionClickCount(nextCount);
    if (nextCount >= 4) {
      if (!labsUnlocked) {
        setLabsUnlocked(true);
        localStorage.setItem(LABS_UNLOCKED_KEY, 'true');
        setShowLabsToast(true);
        setTimeout(() => setShowLabsToast(false), 3000);
      }
      setVersionClickCount(0); 
    }
  };

  const handleLabsToggle = () => {
    if (labsEnabled) {
      setLabsEnabled(false);
      localStorage.setItem(LABS_ENABLED_KEY, 'false');
    } else {
      setDevCodeTarget('labs');
      setShowDevCodePopup(true);
    }
  };

  const handleAudioSummaryLabsToggle = () => {
    if (audioSummaryLabsEnabled) {
      setAudioSummaryLabsEnabled(false);
      localStorage.setItem(AUDIO_SUMMARY_LABS_KEY, 'false');
    } else {
      setDevCodeTarget('audioSummary');
      setShowDevCodePopup(true);
    }
  };

  const handleHideLabs = () => {
    setLabsUnlocked(false);
    localStorage.setItem(LABS_UNLOCKED_KEY, 'false');
    setSettingsView('home');
  };

  const toggleExperimentalFeature = (feature: string) => {
    switch (feature) {
      case 'fluid':
        setFluidAnimations(prev => {
          const next = !prev;
          localStorage.setItem(FLUID_ANIMATIONS_KEY, String(next));
          return next;
        });
        break;
      case 'liquid':
        setLiquidGlassPro(prev => {
          const next = !prev;
          localStorage.setItem(LIQUID_GLASS_PRO_KEY, String(next));
          return next;
        });
        break;
      case 'smart':
        setSmartSummary(prev => {
          const next = !prev;
          localStorage.setItem(SMART_SUMMARY_KEY, String(next));
          return next;
        });
        break;
      case 'dynamic':
        setDynamicThemes(prev => {
          const next = !prev;
          localStorage.setItem(DYNAMIC_THEMES_KEY, String(next));
          return next;
        });
        break;
      case 'ambient':
        setAmbientSounds(prev => {
          const next = !prev;
          localStorage.setItem(AMBIENT_SOUNDS_KEY, String(next));
          return next;
        });
        break;
    }
  };

  const checkDevCode = () => {
    if (devCodeTarget === 'labs') {
      if (devCodeInput === '+×÷=/_') {
        setLabsEnabled(true);
        localStorage.setItem(LABS_ENABLED_KEY, 'true');
        setShowDevCodePopup(false);
        setDevCodeInput('');
        if (content) triggerGenerateSummary(false, content);
      } else {
        setDevCodeInput('');
      }
    } else if (devCodeTarget === 'audioSummary') {
      if (devCodeInput === '!@#₹%^') {
        setAudioSummaryLabsEnabled(true);
        localStorage.setItem(AUDIO_SUMMARY_LABS_KEY, 'true');
        setShowDevCodePopup(false);
        setDevCodeInput('');
      } else {
        setDevCodeInput('');
      }
    }
  };

  const handleOpenSummaryView = () => {
    setMainView('summary');
    if (!summaryDataReady && !summaryLoading) {
      triggerGenerateSummary(false);
    }
  };

  useEffect(() => {
    let interval: number | null = null;
    if (summaryLoading) {
      interval = window.setInterval(() => {
        setSummaryPhase((prev) => {
          const isLastPhase = prev === LOADING_PHRASES.length - 1;
          if (isLastPhase) {
            if (summaryDataReady) {
              setSummaryLoading(false);
              return prev;
            }
            return 0; 
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [summaryLoading, summaryDataReady]);

  if (needsPermission) {
    return (
      <div className="fixed inset-0 bg-[#f2f2f7] z-[1000] flex flex-col items-center justify-center px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-teal-50/50 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
          <div className="mb-10 p-8 bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in duration-1000 border border-white">
            <GalaxyAiLogo />
          </div>
          
          <h1 className="text-[36px] font-black text-[#0f172a] tracking-tight mb-4 leading-[1.1]">
            ¡Resumen<br />Global Now!
          </h1>
          
          <p className="text-[17px] text-[#0f172a]/60 font-bold leading-relaxed mb-12 px-4">
            Experimenta un resumen diario personalizado impulsado por Galaxy AI, adaptado a tu ubicación exacta en cualquier parte del mundo.
          </p>
          
          <div className="w-full space-y-4">
            <button 
              onClick={handleGrantPermission}
              className="w-full py-5 bg-[#0f172a] rounded-[28px] text-[17px] font-black text-white active:scale-95 transition-all shadow-[0_15px_30px_rgba(15,23,42,0.2)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.3)]"
            >
              Conceder acceso a la ubicación
            </button>
            
            <button 
              onClick={() => {
                localStorage.setItem(PERMISSION_GRANTED_KEY, 'true');
                setNeedsPermission(false);
                fetchIpLocation().then(success => {
                  if (!success) runInitialization();
                });
              }}
              className="w-full py-5 bg-white/60 backdrop-blur-xl rounded-[28px] text-[17px] font-black text-[#0f172a] active:scale-95 transition-all border border-white shadow-sm"
            >
              Usar ubicación web
            </button>
          </div>
          
          <div className="mt-12 flex items-center gap-2 opacity-40">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <p className="text-[11px] text-[#0f172a] font-black uppercase tracking-[0.2em]">
              Galaxy AI • Experiencia Global
            </p>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
          </div>
        </div>
      </div>
    );
  }

  if (mainView === 'brief') {
    return (
      <div className={`relative h-screen w-screen overflow-hidden flex flex-col items-center transition-all duration-1000 ${getBackgroundClass()}`}>
        {/* Full Screen Confetti for Birthday */}
        {isBirthdayToday() && !isGenerating && !isSettingsOpen && <FullScreenConfetti duration={4000} />}
        
        {/* Ambient Sound Indicator */}
        {ambientSounds && !isGenerating && !isSettingsOpen && (
          <div className="fixed bottom-6 right-6 z-[500] flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1 bg-white rounded-full"
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Ambient</span>
          </div>
        )}

        <div className={`relative z-10 w-full ${appMode === 'pc' ? 'max-w-5xl' : 'max-w-md'} h-full flex flex-col pt-12 pb-12 px-8 overflow-y-auto scrollbar-hide transition-all duration-500 ${showInfo || isSettingsOpen || showLabsToast ? 'blur-[8px] scale-[0.98] pointer-events-none' : ''}`}>
          
          <div className="flex justify-between items-center mb-6">
            <GalaxyAiLogo />
          </div>

          <header className={`mb-10 min-h-[120px] ${appMode === 'pc' ? 'flex flex-col items-center text-center' : ''}`}>
            {!content || isGenerating ? (
              <div className="flex flex-col animate-in fade-in duration-500">
                <h1 className={`text-[32px] font-medium tracking-tight leading-tight ${getShimmerClass('text')}`}>
                  {isGenerating && totalImagesToLoad > 0 
                    ? `Cargando medios... ${Math.round((imagesLoadedCount / totalImagesToLoad) * 100)}%`
                    : "¡Inicializando...!"}
                </h1>
                <p className={`text-[16px] font-normal mt-1 ${getShimmerClass('subtext')}`}>
                  {isGenerating && totalImagesToLoad > 0 
                    ? `Obteniendo imágenes de alta calidad para tu resumen`
                    : "Galaxy AI está preparando tu resumen"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-700">
                <h1 className={`text-[36px] font-bold tracking-tight leading-tight ${getShimmerClass('text')}`}>
                  {content.greeting}!
                </h1>
                <p className={`text-[17px] font-medium mt-1 leading-snug ${getShimmerClass('subtext')}`}>
                  {content.subtext}
                </p>
              </div>
            )}
          </header>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: fluidAnimations ? 0.8 : 0.5, 
                ease: fluidAnimations ? [0.16, 1, 0.3, 1] : "easeOut" 
              }}
              className={`delayed-content ${appMode === 'pc' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'flex flex-col gap-10'} opacity-100`}
            >
              {activeTab === 'all' && labsEnabled && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center px-2 md:col-span-2"
                >
                  <button 
                    onClick={handleOpenSummaryView}
                    className={`w-full h-16 rounded-full flex items-center justify-center border border-white/60 active:scale-95 transition-all duration-500 ${
                      smartSummary 
                        ? 'bg-gradient-to-r from-purple-100 via-blue-100 to-teal-100 shadow-[0_0_40px_rgba(168,85,247,0.3)]' 
                        : 'bg-gradient-to-r from-[#eef2ff] via-[#f0f9ff] to-[#e6fffa] shadow-[0_0_30px_rgba(165,180,252,0.4)]'
                    }`}
                  >
                    <span className={`text-[17px] font-bold text-[#0f172a] ${smartSummary ? 'animate-pulse' : ''}`}>
                      {summaryDataReady ? (smartSummary ? "✨ Ver Resumen Inteligente" : "Ver resumen") : "Preparando resumen de Galaxy AI..."}
                    </span>
                  </button>
                </motion.div>
              )}

              {content.weather?.alert && (activeTab === 'all' || activeTab === 'weather') && (
                <motion.section 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`${appMode === 'pc' ? 'md:col-span-2' : ''}`}
                >
                  <div className="mb-4 bg-[#ef4444] rounded-[24px] p-5 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)] border border-white/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-white shrink-0 mt-0.5" />
                      <p className="text-[14px] font-bold leading-tight">
                        Hay una alerta de {content.weather.alert.title.replace(/\s*[Ww]arning\s*/g, '').trim()} activa. ¡Mantente a salvo y sigue las recomendaciones locales!
                        {content.weather.alert.title.toLowerCase().includes('rain') && " ¡No olvides tu paraguas!"}
                      </p>
                    </div>
                  </div>
                </motion.section>
              )}

              {activeTab === 'all' && isBirthdayToday() && (
                <section className={`animate-in fade-in slide-in-from-top-4 duration-700 ${appMode === 'pc' ? 'md:col-span-2' : ''}`}>
                  <div className="mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[24px] p-5 text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)] border border-white/20">
                    <div className="flex items-start gap-3">
                      <Cake className="w-6 h-6 text-white shrink-0 mt-0.5" />
                      <p className="text-[14px] font-bold leading-tight">
                        ¡Feliz cumpleaños, {birthdayConfig.name}! Galaxy AI está celebrando contigo hoy. ¡Que tengas un día verdaderamente maravilloso!
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'all' && getActiveReminders().map((reminder, index) => (
                <motion.div 
                  key={reminder.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={appMode === 'pc' ? 'md:col-span-2' : ''}
                >
                  <ReminderCard 
                    title={reminder.title}
                    text={reminder.text}
                    icon={reminder.icon}
                    time={reminder.time}
                    isNight={isNight}
                  />
                </motion.div>
              ))}

              {activeVisibility.weather && content.weather && (activeTab === 'all' || activeTab === 'weather') && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className={`text-[13px] font-bold text-[#0f172a]/60 mb-3 ml-1 tracking-tight ${getShimmerClass('subtext')}`}>
                    Aquí tienes el clima para hoy en {content.weather.location || 'tu zona'}
                  </div>
                  <div className={`rounded-[32px] overflow-hidden ${getCardClass()}`}>
                    <WeatherCard data={content.weather} isNight={isNight} />
                  </div>
                </motion.section>
              )}

              {activeVisibility.youtube && content.youtubeUploads && content.youtubeUploads.length > 0 && (activeTab === 'all' || activeTab === 'media') && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className={`text-[13px] font-bold text-[#0f172a]/60 mb-3 ml-1 tracking-tight ${getShimmerClass('subtext')}`}>
                    ¡Aquí tienes algunos videos de YouTube que podrías querer ver!
                  </div>
                  <div className={`rounded-[32px] overflow-hidden ${getCardClass()}`}>
                    <YoutubeCard uploads={content.youtubeUploads} isNight={isNight} onImageLoad={handleImageLoad} />
                  </div>
                </motion.section>
              )}

              {activeVisibility.spotify && content.spotifyItems && content.spotifyItems.length > 0 && (activeTab === 'all' || activeTab === 'media') && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className={`text-[13px] font-bold text-[#0f172a]/60 mb-3 ml-1 tracking-tight ${getShimmerClass('subtext')}`}>
                    ¡Aquí tienes una lista de reproducción de Spotify para ti!
                  </div>
                  <div className={`rounded-[32px] overflow-hidden ${getCardClass()}`}>
                    <SpotifyCard items={content.spotifyItems} isNight={isNight} onImageLoad={handleImageLoad} />
                  </div>
                </motion.section>
              )}

              {activeVisibility.news && content.news && content.news.length > 0 && (activeTab === 'all' || activeTab === 'news') && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <div className={`text-[13px] font-bold text-[#0f172a]/60 mb-3 ml-1 tracking-tight ${getShimmerClass('subtext')}`}>
                    ¡Aquí tienes las últimas noticias solo para ti!
                  </div>
                  <div className={`rounded-[32px] overflow-hidden ${getCardClass()}`}>
                    <NewsCard news={content.news} isNight={isNight} onImageLoad={handleImageLoad} />
                  </div>
                </motion.section>
              )}

              {activeTab === 'all' && content.occasion && content.occasion.isOccasion && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={`${appMode === 'pc' ? 'md:col-span-2' : ''}`}
                >
                  <OccasionCard 
                    occasion={content.occasion} 
                    isNight={isNight} 
                    shimmerClass={getShimmerClass('subtext')} 
                    cardClass={getCardClass()} 
                  />
                </motion.div>
              )}

              {activeTab === 'all' && isBirthdayToday() && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`${appMode === 'pc' ? 'md:col-span-2' : ''}`}
                >
                  <BirthdayCard name={birthdayConfig.name} isNight={isNight} />
                </motion.div>
              )}

              {activeTab === 'all' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`${appMode === 'pc' ? 'md:col-span-2' : ''}`}
                >
                   <NowBriefPromoCard shimmerClass={getShimmerClass('subtext')} cardClass={getCardClass()} isNight={isNight} />
                </motion.div>
              )}

              <div className="pb-40" />
            </motion.div>
          </AnimatePresence>
        </div>

        {appMode === 'pc' && !isGenerating && !isSettingsOpen && !showInfo && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-auto animate-in slide-in-from-bottom-10 duration-700">
            <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full p-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full transition-all duration-300 ${activeTab === tab.id ? 'bg-white/90 text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  {tab.icon}
                  <span className="text-[14px] font-bold tracking-tight">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`fixed top-8 right-8 z-[150] transition-all duration-700 ease-out ${content && audioBriefEnabled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'} ${showInfo || isSettingsOpen ? 'opacity-0 pointer-events-none' : ''}`}>
          {showSummaryPrompt && (
            <div className="absolute top-full right-0 mt-4 animate-in fade-in slide-in-from-top-4 duration-500 z-[160]">
              <div className="relative bg-[#0f172a] text-white px-5 py-4 rounded-[24px] shadow-2xl min-w-[180px]">
                <p className="text-[14px] font-bold leading-tight mb-3">¿Leer el resumen en voz alta?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={handleReadSummary}
                    className="flex-1 py-2 bg-white/20 hover:bg-white/30 rounded-full text-[12px] font-black transition-colors"
                  >
                    Sí
                  </button>
                  <button 
                    onClick={() => setShowSummaryPrompt(false)}
                    className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[12px] font-black transition-colors"
                  >
                    No
                  </button>
                </div>
                {/* Speech Bubble Arrow */}
                <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[#0f172a] rotate-45" />
              </div>
            </div>
          )}
          {isTtsActive ? (
            <div className="flex items-center bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl rounded-full px-4 py-2 gap-4 animate-in slide-in-from-top-10 duration-500">
               <button onClick={() => skipAudio('backward')} className="p-1.5 active:scale-90 transition-transform">
                 <SkipBack className="w-5 h-5 text-black/70" />
               </button>
               <button onClick={handleReadBrief} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center active:scale-90 transition-transform relative">
                 {isTtsPlaying ? <Pause className="w-5 h-5 text-black/70" /> : <Play className="w-5 h-5 text-black/70 ml-0.5" />}
               </button>
               <button onClick={() => skipAudio('forward')} className="p-1.5 active:scale-90 transition-transform">
                 <SkipForward className="w-5 h-5 text-black/70" />
               </button>
               <div className="w-[1px] h-6 bg-black/10 mx-0.5" />
               <button onClick={stopTts} className="p-1.5 active:scale-90 transition-transform">
                 <X className="w-5 h-5 text-black/70" />
               </button>
            </div>
          ) : (
            <button 
              onClick={handleReadBrief} 
              disabled={isTtsLoading}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl active:scale-90 transition-all disabled:opacity-50 relative overflow-visible"
            >
              {isTtsLoading ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <div className="scale-125">
                  <WaveformIcon />
                </div>
              )}
            </button>
          )}
        </div>

        <div className={`fixed bottom-12 right-8 z-[80] flex items-center gap-3 transition-all duration-700 ease-out ${content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'} ${showInfo || isSettingsOpen ? 'opacity-0 pointer-events-none' : ''}`}>
          <button onClick={() => setShowInfo(true)} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl active:scale-90 transition-transform">
            <AlertCircle className="w-6 h-6 text-black/70" strokeWidth={1.5} />
          </button>
          <button onClick={handleOpenSettings} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl active:scale-90 transition-transform">
            <Settings className="w-6 h-6 text-black/70" strokeWidth={1.5} />
          </button>
        </div>

        <div className={`fixed bottom-12 left-8 z-[80] transition-all duration-700 ease-out ${showRefreshPopup && !isSettingsOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
          <button 
            onClick={() => runInitialization(location?.lat, location?.lng, true)} 
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl active:scale-90 transition-all group overflow-hidden"
          >
            <RotateCw className="w-6 h-6 text-black/60 transition-transform duration-700 group-hover:rotate-180" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          </button>
        </div>

        <div className={`fixed top-14 z-[250] bg-black/80 backdrop-blur-md px-6 py-3 rounded-full transition-all duration-500 transform ${showLabsToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
          <p className="text-white text-[14px] font-medium">Now Brief Labs ha sido activado</p>
        </div>

        {/* TTS Error Popup */}
        <div className={`fixed inset-0 z-[400] flex items-center justify-center px-6 transition-all duration-300 ${showTtsError ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTtsError(false)} />
           <div className="relative bg-white rounded-[44px] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                <Volume2 className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-center mb-8">
                <p className="text-[18px] font-bold text-[#0f172a] leading-tight mb-3">
                  No se pudo generar el resumen de audio
                </p>
                <p className="text-[14px] text-[#0f172a]/70 leading-relaxed font-medium">
                  {ttsErrorMessage || "Galaxy AI encontró un problema. Esto puede deberse a una interrupción temporal del servicio o al límite de la API. Por favor, inténtalo de nuevo más tarde."}
                </p>
              </div>
              <button 
                onClick={() => setShowTtsError(false)} 
                className="w-full py-4 bg-[#0f172a] rounded-[24px] text-[16px] font-bold text-white active:scale-95 transition-transform"
              >
                Intentar más tarde
              </button>
           </div>
        </div>

        {/* Info Dialog Overlay */}
        <div className={`fixed inset-0 z-[400] flex items-center justify-center px-6 transition-all duration-300 ${showInfo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInfo(false)} />
           <div className="relative bg-white rounded-[44px] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center mb-8">
                <p className="text-[18px] font-bold text-[#0f172a] leading-tight mb-3">
                  Tu resumen Now contiene contenido generado por IA.
                </p>
                <p className="text-[14px] text-[#0f172a]/70 leading-relaxed font-medium">
                  Consulta los <a href="https://policies.account.samsung.com/terms?appKey=j5p7ll8g33&applicationRegion=ind&language=eng&type=TC" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Términos y Condiciones</a> para obtener más información sobre las funciones de inteligencia avanzada de Galaxy AI.
                </p>
              </div>
              <button 
                onClick={() => setShowInfo(false)} 
                className="w-full py-4 bg-[#0f172a] rounded-[24px] text-[16px] font-bold text-white active:scale-95 transition-transform"
              >
                Aceptar
              </button>
           </div>
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          view={settingsView}
          setView={setSettingsView}
          pendingVisibility={pendingVisibility}
          onToggleVisibility={toggleVisibility}
          manualLocation={manualLocation}
          setManualLocation={setManualLocation}
          isEditingLocation={isEditingLocation}
          setIsEditingLocation={setIsEditingLocation}
          onSaveManualLocation={handleSaveManualLocation}
          labsUnlocked={labsUnlocked}
          labsEnabled={labsEnabled}
          onLabsToggle={handleLabsToggle}
          audioSummaryLabsEnabled={audioSummaryLabsEnabled}
          onAudioSummaryLabsToggle={handleAudioSummaryLabsToggle}
          fluidAnimations={fluidAnimations}
          liquidGlassPro={liquidGlassPro}
          smartSummary={smartSummary}
          dynamicThemes={dynamicThemes}
          ambientSounds={ambientSounds}
          onToggleExperimental={toggleExperimentalFeature}
          onHideLabs={handleHideLabs}
          audioBriefEnabled={audioBriefEnabled}
          onToggleAudioBrief={handleToggleAudioBrief}
          selectedVoice={selectedVoice}
          onSelectVoice={handleSelectVoice}
          onVersionClick={handleVersionClick}
          birthdayConfig={birthdayConfig}
          onUpdateBirthday={handleUpdateBirthday}
          reminders={reminders}
          onUpdateReminders={handleUpdateReminders}
          isNight={isNight}
        />

        <div className={`fixed inset-0 z-[300] flex items-center justify-center px-6 transition-all duration-300 ${showDevCodePopup ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDevCodePopup(false)} />
           <div className="relative bg-white rounded-[44px] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center">
              <h3 className="text-[18px] font-bold text-[#0f172a] mb-6">Ingresa el código de desarrollador</h3>
              <input type="text" value={devCodeInput} onChange={(e) => setDevCodeInput(e.target.value)} placeholder="Código" className="w-full bg-gray-100 rounded-[20px] px-6 py-4 text-[16px] font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-8" />
              <div className="flex w-full gap-4">
                 <button onClick={() => setShowDevCodePopup(false)} className="flex-1 py-4 text-[16px] font-bold text-gray-400">Cancelar</button>
                 <button onClick={checkDevCode} className="flex-1 py-4 bg-indigo-600 rounded-[24px] text-[16px] font-bold text-white active:scale-95 transition-transform">Aceptar</button>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <SummaryView
      onBack={() => setMainView('brief')}
      summaryLoading={summaryLoading}
      summaryPhase={summaryPhase}
      loadingPhrases={LOADING_PHRASES}
      generatedSummary={generatedSummary}
      summaryDataReady={summaryDataReady}
      isTtsActive={isTtsActive}
      isTtsPlaying={isTtsPlaying}
      isTtsLoading={isTtsLoading}
      onReadSummary={handleReadSummary}
      onStopTts={stopTts}
      onSkipAudio={skipAudio}
      onRefresh={() => {
        setMainView('brief');
        runInitialization(location?.lat, location?.lng, true);
      }}
      isNight={isNight}
    />
  );
};

export default App;