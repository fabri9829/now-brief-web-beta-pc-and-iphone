import React, { useState } from 'react';
import { ChevronLeft, Volume2, Settings, FlaskConical, Info, AlertCircle, RotateCw, Music, Check, Lightbulb, X, Youtube, Plus, Trash2, TreePine, Dumbbell, Pill, Bell, Coffee, Book, Search, Clock, Cake, Monitor, Smartphone, Sparkles, Zap, Brain, Palette } from 'lucide-react';
import { ReminderConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'home' | 'customize' | 'about' | 'labs' | 'credits' | 'reminders';
  setView: (view: any) => void;
  labsUnlocked: boolean;
  labsEnabled: boolean;
  onLabsToggle: () => void;
  audioSummaryLabsEnabled: boolean;
  onAudioSummaryLabsToggle: () => void;
  audioBriefEnabled: boolean;
  onToggleAudioBrief: () => void;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
  onHideLabs: () => void;
  onVersionClick: () => void;
  fluidAnimations: boolean;
  liquidGlassPro: boolean;
  smartSummary: boolean;
  dynamicThemes: boolean;
  ambientSounds: boolean;
  onToggleExperimental: (feature: string) => void;
  pendingVisibility: any;
  onToggleVisibility: (key: any) => void;
  manualLocation: string;
  setManualLocation: (val: string) => void;
  isEditingLocation: boolean;
  setIsEditingLocation: (val: boolean) => void;
  onSaveManualLocation: () => void;
  birthdayConfig: { enabled: boolean; name: string; date: string };
  onUpdateBirthday: (config: any) => void;
  reminders: ReminderConfig[];
  onUpdateReminders: (reminders: ReminderConfig[]) => void;
  isNight?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  view,
  setView,
  labsUnlocked,
  labsEnabled,
  onLabsToggle,
  audioSummaryLabsEnabled,
  onAudioSummaryLabsToggle,
  audioBriefEnabled,
  onToggleAudioBrief,
  selectedVoice,
  onSelectVoice,
  onHideLabs,
  onVersionClick,
  fluidAnimations,
  liquidGlassPro,
  smartSummary,
  dynamicThemes,
  ambientSounds,
  onToggleExperimental,
  pendingVisibility,
  onToggleVisibility,
  manualLocation,
  setManualLocation,
  isEditingLocation,
  setIsEditingLocation,
  onSaveManualLocation,
  birthdayConfig,
  onUpdateBirthday,
  reminders,
  onUpdateReminders,
  isNight
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReminder, setEditingReminder] = useState<ReminderConfig | null>(null);
  const [originalReminder, setOriginalReminder] = useState<ReminderConfig | null>(null);
  const [isNewReminder, setIsNewReminder] = useState(false);

  const voices = [
    { id: 'Zephyr', name: 'Zephyr', description: 'Voz equilibrada y clara' },
    { id: 'Puck', name: 'Puck', description: 'Voz juvenil y enérgica' },
    { id: 'Charon', name: 'Charon', description: 'Voz profunda y calmada' },
    { id: 'Kore', name: 'Kore', description: 'Voz suave y profesional' },
    { id: 'Fenrir', name: 'Fenrir', description: 'Voz fuerte y autoritaria' },
  ];

  if (!isOpen) return null;

  const icons = [
    { id: 'tree', icon: <TreePine className="w-5 h-5" />, label: 'Planta' },
    { id: 'dumbbell', icon: <Dumbbell className="w-5 h-5" />, label: 'Ejercicio' },
    { id: 'pill', icon: <Pill className="w-5 h-5" />, label: 'Medicina' },
    { id: 'bell', icon: <Bell className="w-5 h-5" />, label: 'Alerta' },
    { id: 'coffee', icon: <Coffee className="w-5 h-5" />, label: 'Descanso' },
    { id: 'book', icon: <Book className="w-5 h-5" />, label: 'Estudio' },
  ];

  const handleAddReminder = () => {
    const newReminder: ReminderConfig = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Nuevo recordatorio',
      text: '',
      icon: 'bell',
      time: '08:00',
      enabled: true,
    };
    setEditingReminder(newReminder);
    setOriginalReminder(newReminder);
    setIsNewReminder(true);
  };

  const handleEditReminder = (reminder: ReminderConfig) => {
    setEditingReminder({ ...reminder });
    setOriginalReminder({ ...reminder });
    setIsNewReminder(false);
  };

  const handleUpdateDraft = (updates: Partial<ReminderConfig>) => {
    if (editingReminder) {
      setEditingReminder({ ...editingReminder, ...updates });
    }
  };

  const handleSaveReminder = () => {
    if (!editingReminder) return;
    
    if (isNewReminder) {
      onUpdateReminders([...reminders, editingReminder]);
    } else {
      onUpdateReminders(reminders.map(r => r.id === editingReminder.id ? editingReminder : r));
    }
    setEditingReminder(null);
    setOriginalReminder(null);
    setIsNewReminder(false);
  };

  const handleUpdateReminder = (id: string, updates: Partial<ReminderConfig>) => {
    const updatedReminders = reminders.map(r => r.id === id ? { ...r, ...updates } : r);
    onUpdateReminders(updatedReminders);
  };

  const handleDeleteReminder = (id: string) => {
    onUpdateReminders(reminders.filter(r => r.id !== id));
    if (editingReminder?.id === id) {
      setEditingReminder(null);
      setOriginalReminder(null);
      setIsNewReminder(false);
    }
  };

  const hasChanges = editingReminder && originalReminder && 
    JSON.stringify(editingReminder) !== JSON.stringify(originalReminder);

  const filteredReminders = reminders.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`fixed inset-0 z-[1000] ${isNight ? 'bg-[#000000]' : 'bg-[#f2f2f7]'} transition-all duration-500 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="h-full flex flex-col max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-14 pb-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => { 
                if (view === 'home') onClose(); 
                else if (view === 'reminders') {
                  if (editingReminder) {
                    setEditingReminder(null);
                    setOriginalReminder(null);
                    setIsNewReminder(false);
                  } else {
                    setView('customize');
                  }
                }
                else setView('home'); 
              }} 
              className={`p-2 -ml-2 active:scale-90 transition-transform ${isNight ? 'text-white' : 'text-[#0f172a]'}`}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <h2 className={`text-[30px] font-bold tracking-tight ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>
              {view === 'home' && 'Ajustes'}
              {view === 'customize' && 'Personalizar Now Brief'}
              {view === 'about' && 'Acerca de Now Brief'}
              {view === 'labs' && 'Laboratorio'}
              {view === 'credits' && 'Créditos'}
              {view === 'reminders' && 'Recordatorios'}
            </h2>
          </div>
          {view === 'home' && (
            <button className={`p-2.5 rounded-full ${isNight ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-600'}`}>
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-4 py-2 flex-1 overflow-y-auto scrollbar-hide">
          {view === 'home' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Profile/Account Section (Mock) */}
              <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] p-6 flex items-center gap-4 shadow-sm`}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {isNight ? 'N' : 'B'}
                </div>
                <div className="flex-1">
                  <h3 className={`text-[19px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>Usuario Now Brief</h3>
                  <p className={`text-[14px] ${isNight ? 'text-white/50' : 'text-gray-500'}`}>Mantente al día con el resumen de Now Brief</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
              </div>

              {/* Main Settings Group */}
              <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] overflow-hidden shadow-sm`}>
                <MenuButton 
                  icon={<Settings className="w-5 h-5 text-white" />} 
                  iconBg="bg-gray-500"
                  title="Personalizar Now Brief" 
                  onClick={() => setView('customize')} 
                  isNight={isNight} 
                />
                {labsUnlocked && (
                  <MenuButton 
                    icon={<FlaskConical className="w-5 h-5 text-white" />} 
                    iconBg="bg-green-500"
                    title="Funciones experimentales" 
                    onClick={() => setView('labs')} 
                    isNight={isNight} 
                  />
                )}
                <MenuButton 
                  icon={<Bell className="w-5 h-5 text-white" />} 
                  iconBg="bg-orange-500"
                  title="Recordatorios personalizados" 
                  onClick={() => setView('reminders')} 
                  isNight={isNight} 
                  isLast
                />
              </div>

              {/* Info Group */}
              <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] overflow-hidden shadow-sm`}>
                <MenuButton 
                  icon={<Info className="w-5 h-5 text-white" />} 
                  iconBg="bg-blue-500"
                  title="Acerca de Now Brief" 
                  onClick={() => setView('about')} 
                  isNight={isNight} 
                />
                <MenuButton 
                  icon={<AlertCircle className="w-5 h-5 text-white" />} 
                  iconBg="bg-blue-400"
                  title="Créditos y soporte" 
                  onClick={() => setView('credits')} 
                  isLast 
                  isNight={isNight} 
                />
              </div>
            </div>
          )}
          
          {view === 'customize' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              {/* Audio Section */}
              <div className="space-y-2">
                <h3 className={`px-6 text-[13px] font-bold ${isNight ? 'text-white/40' : 'text-gray-500'} uppercase tracking-wider`}>Audio y Voz</h3>
                <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] overflow-hidden shadow-sm`}>
                  <SettingToggleItem 
                    icon={<Volume2 className="w-5 h-5 text-white" />} 
                    iconBg="bg-blue-500"
                    title="Resumen de audio" 
                    active={audioBriefEnabled} 
                    onToggle={onToggleAudioBrief}
                    isNight={isNight}
                  />
                  
                  {audioBriefEnabled && (
                    <div className={`px-6 py-5 ${isNight ? 'bg-white/5' : 'bg-gray-50/50'} animate-in fade-in slide-in-from-top-2 duration-300`}>
                      <p className={`text-[13px] font-bold ${isNight ? 'text-white/60' : 'text-gray-500'} mb-4 ml-1`}>Seleccionar Voz</p>
                      <div className="space-y-2">
                        {voices.map((voice) => (
                          <button
                            key={voice.id}
                            onClick={() => onSelectVoice(voice.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-all ${
                              selectedVoice === voice.id 
                                ? 'bg-blue-600 text-white shadow-md scale-[1.02]' 
                                : (isNight ? 'bg-white/5 text-white/80' : 'bg-white text-[#0f172a] border border-gray-100')
                            }`}
                          >
                            <div className="flex flex-col text-left">
                              <span className="text-[16px] font-bold">{voice.name}</span>
                              <span className={`text-[12px] ${selectedVoice === voice.id ? 'text-white/70' : 'text-gray-400'}`}>{voice.description}</span>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedVoice === voice.id ? 'border-white bg-white' : (isNight ? 'border-white/20' : 'border-gray-200')}`}>
                              {selectedVoice === voice.id && <Check className="w-4 h-4 text-blue-600 stroke-[3px]" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-2">
                <h3 className={`px-6 text-[13px] font-bold ${isNight ? 'text-white/40' : 'text-gray-500'} uppercase tracking-wider`}>Ubicación</h3>
                <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] overflow-hidden shadow-sm p-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <RotateCw className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-[17px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>Ubicación del clima</span>
                    </div>
                    <button 
                      onClick={() => setIsEditingLocation(!isEditingLocation)}
                      className={`text-[15px] font-bold ${isNight ? 'text-blue-400' : 'text-blue-600'} active:scale-95 transition-transform`}
                    >
                      {isEditingLocation ? 'Cancelar' : (manualLocation ? 'Cambiar' : 'Establecer')}
                    </button>
                  </div>
                  
                  {isEditingLocation ? (
                    <div className="flex gap-2 mt-4">
                      <input 
                        type="text" 
                        value={manualLocation}
                        onChange={(e) => setManualLocation(e.target.value)}
                        placeholder="ej. Londres, Reino Unido"
                        className={`flex-1 ${isNight ? 'bg-white/5 text-white' : 'bg-gray-50 text-[#0f172a]'} border-none rounded-[20px] px-5 py-3.5 text-[15px] font-medium focus:ring-2 focus:ring-blue-500/20 outline-none`}
                      />
                      <button 
                        onClick={onSaveManualLocation}
                        className="bg-blue-600 text-white px-6 rounded-[20px] text-[15px] font-bold active:scale-95 transition-transform shadow-md"
                      >
                        Guardar
                      </button>
                    </div>
                  ) : (
                    <p className={`text-[15px] ${isNight ? 'text-white/40' : 'text-gray-400'} font-medium ml-14`}>
                      {manualLocation || 'Usando ubicación automática'}
                    </p>
                  )}
                </div>
              </div>

              {/* Content Visibility Section */}
              <div className="space-y-2">
                <h3 className={`px-6 text-[13px] font-bold ${isNight ? 'text-white/40' : 'text-gray-500'} uppercase tracking-wider`}>Contenido del Resumen</h3>
                <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] overflow-hidden shadow-sm`}>
                  <SettingToggleItem icon={<RotateCw className="w-5 h-5 text-white" />} iconBg="bg-blue-400" title="Clima" active={pendingVisibility.weather} onToggle={() => onToggleVisibility('weather')} isNight={isNight} />
                  <SettingToggleItem icon={<Youtube className="w-5 h-5 text-white" />} iconBg="bg-red-500" title="YouTube" active={pendingVisibility.youtube} onToggle={() => onToggleVisibility('youtube')} isNight={isNight} />
                  <SettingToggleItem icon={<Music className="w-5 h-5 text-white" />} iconBg="bg-green-500" title="Spotify" active={pendingVisibility.spotify} onToggle={() => onToggleVisibility('spotify')} isNight={isNight} />
                  <SettingToggleItem icon={<Info className="w-5 h-5 text-white" />} iconBg="bg-orange-500" title="Noticias" active={pendingVisibility.news} onToggle={() => onToggleVisibility('news')} isNight={isNight} />
                  <SettingToggleItem 
                    icon={<Cake className="w-5 h-5 text-white" />} 
                    iconBg="bg-pink-500"
                    title="Cumpleaños" 
                    active={birthdayConfig.enabled} 
                    onToggle={() => onUpdateBirthday({ enabled: !birthdayConfig.enabled })} 
                    isLast={!birthdayConfig.enabled} 
                    isNight={isNight} 
                  />

                  {birthdayConfig.enabled && (
                    <div className={`px-6 py-6 ${isNight ? 'bg-white/5' : 'bg-gray-50/50'} space-y-5 animate-in fade-in slide-in-from-top-2 duration-300`}>
                      <div className="space-y-2">
                        <label className={`text-[12px] font-bold ${isNight ? 'text-white/40' : 'text-gray-400'} uppercase ml-2`}>Tu nombre</label>
                        <input 
                          type="text" 
                          value={birthdayConfig.name}
                          onChange={(e) => onUpdateBirthday({ name: e.target.value })}
                          placeholder="Ingresa tu nombre"
                          className={`w-full ${isNight ? 'bg-white/5 text-white' : 'bg-white text-[#0f172a]'} border-none rounded-[20px] px-5 py-3.5 text-[15px] font-medium focus:ring-2 focus:ring-pink-500/20 outline-none shadow-sm`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[12px] font-bold ${isNight ? 'text-white/40' : 'text-gray-400'} uppercase ml-2`}>Fecha de cumpleaños</label>
                        <input 
                          type="date" 
                          value={birthdayConfig.date}
                          onChange={(e) => onUpdateBirthday({ date: e.target.value })}
                          className={`w-full ${isNight ? 'bg-white/5 text-white' : 'bg-white text-[#0f172a]'} border-none rounded-[20px] px-5 py-3.5 text-[15px] font-medium focus:ring-2 focus:ring-pink-500/20 outline-none shadow-sm`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === 'reminders' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              {!editingReminder ? (
                <>
                  <div className="relative px-2">
                    <Search className={`absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 ${isNight ? 'text-white/40' : 'text-gray-400'}`} />
                    <input 
                      type="text"
                      placeholder="Buscar recordatorios"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full ${isNight ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#0f172a]'} border-none rounded-[24px] pl-14 pr-6 py-4 text-[16px] font-medium focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm`}
                    />
                  </div>

                  <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] overflow-hidden shadow-sm`}>
                    {filteredReminders.length > 0 ? (
                      filteredReminders.map((reminder, idx, arr) => (
                        <div key={reminder.id} className={`flex items-center justify-between p-6 ${idx !== arr.length - 1 ? (isNight ? 'border-b border-white/5' : 'border-b border-gray-100') : ''}`}>
                          <button 
                            onClick={() => handleEditReminder(reminder)}
                            className="flex items-center gap-5 flex-1 text-left"
                          >
                            <div className={`w-12 h-12 rounded-full ${isNight ? 'bg-white/5' : 'bg-gray-50'} flex items-center justify-center`}>
                              {icons.find(i => i.id === reminder.icon)?.icon || <Bell className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className={`text-[17px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>{reminder.title}</p>
                              <p className={`text-[14px] font-medium ${isNight ? 'text-white/40' : 'text-gray-400'}`}>{reminder.time}</p>
                            </div>
                          </button>
                          <button 
                            onClick={() => handleUpdateReminder(reminder.id, { enabled: !reminder.enabled })}
                            className={`w-12 h-7 rounded-full transition-colors relative duration-300 ${reminder.enabled ? 'bg-blue-600' : (isNight ? 'bg-white/10' : 'bg-gray-300')}`}
                          >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm transform ${reminder.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <Bell className={`w-12 h-12 mx-auto mb-4 opacity-20 ${isNight ? 'text-white' : 'text-black'}`} />
                        <p className={`text-[15px] font-medium ${isNight ? 'text-white/40' : 'text-gray-400'}`}>No se encontraron recordatorios</p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleAddReminder}
                    className="w-full h-16 rounded-[28px] bg-blue-600 text-white flex items-center justify-center gap-3 font-bold active:scale-95 transition-transform shadow-lg"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-[17px]">Añadir recordatorio</span>
                  </button>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between px-4">
                    <button onClick={() => setEditingReminder(null)} className={`text-[16px] font-bold ${isNight ? 'text-blue-400' : 'text-blue-600'}`}>Cancelar</button>
                    <div className="flex items-center gap-5">
                      <button onClick={() => handleDeleteReminder(editingReminder.id)} className="p-2 text-red-500 active:scale-90 transition-transform">
                        <Trash2 className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={handleSaveReminder}
                        disabled={!hasChanges}
                        className={`px-8 py-2.5 rounded-full text-[16px] font-bold transition-all ${
                          hasChanges 
                            ? 'bg-blue-600 text-white active:scale-95 shadow-md' 
                            : (isNight ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-400')
                        }`}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>

                  <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] p-8 space-y-7 shadow-sm`}>
                    <div className="space-y-2">
                      <label className={`text-[12px] font-bold ${isNight ? 'text-white/40' : 'text-gray-400'} uppercase ml-2`}>Título</label>
                      <input 
                        type="text" 
                        value={editingReminder.title}
                        onChange={(e) => handleUpdateDraft({ title: e.target.value })}
                        placeholder="ej. Cuidado de plantas"
                        className={`w-full ${isNight ? 'bg-white/5 text-white' : 'bg-gray-50 text-[#0f172a]'} border-none rounded-[20px] px-5 py-4 text-[16px] font-medium focus:ring-2 focus:ring-blue-500/20 outline-none`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`text-[12px] font-bold ${isNight ? 'text-white/40' : 'text-gray-400'} uppercase ml-2`}>Contenido</label>
                      <textarea 
                        value={editingReminder.text}
                        onChange={(e) => handleUpdateDraft({ text: e.target.value })}
                        placeholder="ej. Recuerda regar los lirios"
                        rows={3}
                        className={`w-full ${isNight ? 'bg-white/5 text-white' : 'bg-gray-50 text-[#0f172a]'} border-none rounded-[20px] px-5 py-4 text-[16px] font-medium focus:ring-2 focus:ring-blue-500/20 outline-none resize-none`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className={`text-[12px] font-bold ${isNight ? 'text-white/40' : 'text-gray-400'} uppercase ml-2`}>Hora</label>
                        <input 
                          type="time" 
                          value={editingReminder.time}
                          onChange={(e) => handleUpdateDraft({ time: e.target.value })}
                          className={`w-full ${isNight ? 'bg-white/5 text-white' : 'bg-gray-50 text-[#0f172a]'} border-none rounded-[20px] px-5 py-4 text-[16px] font-medium focus:ring-2 focus:ring-blue-500/20 outline-none`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-[12px] font-bold ${isNight ? 'text-white/40' : 'text-gray-400'} uppercase ml-2`}>Icono actual</label>
                        <div className={`flex items-center justify-center h-[56px] ${isNight ? 'bg-white/5 text-white' : 'bg-gray-50 text-[#0f172a]'} rounded-[20px]`}>
                          {icons.find(i => i.id === editingReminder.icon)?.icon}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[12px] font-bold ${isNight ? 'text-white/40' : 'text-gray-400'} uppercase ml-2`}>Seleccionar icono</label>
                      <div className="grid grid-cols-3 gap-4">
                        {icons.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleUpdateDraft({ icon: item.id })}
                            className={`flex flex-col items-center justify-center p-5 rounded-[24px] transition-all ${editingReminder.icon === item.id ? 'bg-blue-600 text-white shadow-lg scale-105' : (isNight ? 'bg-white/5 text-white/60' : 'bg-gray-50 text-gray-500')}`}
                          >
                            {item.icon}
                            <span className="text-[11px] font-bold mt-2 uppercase tracking-tight">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'labs' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="space-y-2">
                <h3 className={`px-6 text-[13px] font-bold ${isNight ? 'text-white/40' : 'text-gray-500'} uppercase tracking-wider`}>Laboratorio</h3>
                <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] overflow-hidden shadow-sm`}>
                  <SettingToggleItem 
                    icon={<Lightbulb className="w-5 h-5 text-white" />} 
                    iconBg="bg-indigo-500" 
                    title="Resumir resumen Now" 
                    badge="Nuevo" 
                    active={labsEnabled} 
                    onToggle={onLabsToggle} 
                    isNight={isNight} 
                  />
                  <SettingToggleItem 
                    icon={<Volume2 className="w-5 h-5 text-white" />} 
                    iconBg="bg-blue-500" 
                    title="Seguimiento de audio" 
                    badge="Dev" 
                    active={audioSummaryLabsEnabled} 
                    onToggle={onAudioSummaryLabsToggle} 
                    isNight={isNight} 
                  />
                  <SettingToggleItem 
                    icon={<Sparkles className="w-5 h-5 text-white" />} 
                    iconBg="bg-amber-500" 
                    title="Modo Fluido" 
                    badge="Beta" 
                    active={fluidAnimations} 
                    onToggle={() => onToggleExperimental('fluid')} 
                    isNight={isNight} 
                  />
                  <SettingToggleItem 
                    icon={<Zap className="w-5 h-5 text-white" />} 
                    iconBg="bg-cyan-500" 
                    title="Liquid Glass Pro" 
                    badge="VFX" 
                    active={liquidGlassPro} 
                    onToggle={() => onToggleExperimental('liquid')} 
                    isNight={isNight} 
                  />
                  <SettingToggleItem 
                    icon={<Brain className="w-5 h-5 text-white" />} 
                    iconBg="bg-purple-500" 
                    title="Resumen Inteligente" 
                    badge="AI" 
                    active={smartSummary} 
                    onToggle={() => onToggleExperimental('smart')} 
                    isNight={isNight} 
                  />
                  <SettingToggleItem 
                    icon={<Palette className="w-5 h-5 text-white" />} 
                    iconBg="bg-pink-500" 
                    title="Temas Dinámicos" 
                    badge="UI" 
                    active={dynamicThemes} 
                    onToggle={() => onToggleExperimental('dynamic')} 
                    isNight={isNight} 
                  />
                  <SettingToggleItem 
                    icon={<Music className="w-5 h-5 text-white" />} 
                    iconBg="bg-rose-500" 
                    title="Sonidos Ambientales" 
                    badge="Audio" 
                    active={ambientSounds} 
                    onToggle={() => onToggleExperimental('ambient')} 
                    isNight={isNight} 
                  />
                  <MenuButton 
                    icon={<FlaskConical className="w-5 h-5 text-white" />} 
                    iconBg="bg-gray-500" 
                    title="Ocultar Laboratorio" 
                    onClick={onHideLabs} 
                    isLast 
                    isNight={isNight} 
                  />
                </div>
              </div>
            </div>
          )}

          {view === 'about' && (
            <div className="h-full flex flex-col items-center justify-center pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className={`mb-8 p-8 ${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[48px] shadow-sm`}>
                 <div className="w-16 h-16 bg-blue-600 rounded-3xl rotate-12 flex items-center justify-center shadow-lg">
                    <RotateCw className="w-10 h-10 text-white" />
                 </div>
              </div>
              <h1 className={`text-[36px] font-black ${isNight ? 'text-white' : 'text-[#0f172a]'} tracking-tight mb-2 text-center`}>Now Brief!</h1>
              <p onClick={onVersionClick} className={`text-[18px] font-bold ${isNight ? 'text-white/60' : 'text-[#0f172a]/60'} mb-6 text-center select-none cursor-pointer active:scale-95 transition-transform`}>v1.2.3.1 (Global)</p>
              
              <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white/80'} backdrop-blur-md px-10 py-6 rounded-[32px] shadow-sm flex flex-col items-center mb-6`}>
                <p className={`text-[13px] font-bold ${isNight ? 'text-white/40' : 'text-[#0f172a]/40'} uppercase tracking-widest mb-1`}>Versión de Galaxy AI</p>
                <p className={`text-[17px] font-black ${isNight ? 'text-white' : 'text-[#0f172a]'} text-center leading-tight`}>One UI 8.0</p>
              </div>

              <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white/80'} backdrop-blur-md px-10 py-6 rounded-[32px] shadow-sm flex flex-col items-center`}>
                <p className={`text-[16px] font-black ${isNight ? 'text-white' : 'text-[#0f172a]'} text-center leading-tight`}>La última versión ya está instalada</p>
              </div>
            </div>
          )}

          {view === 'credits' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <div className={`${isNight ? 'bg-[#1c1c1e]' : 'bg-white'} rounded-[32px] p-8 shadow-sm text-center`}>
                <div className={`w-20 h-20 rounded-full ${isNight ? 'bg-blue-500/10' : 'bg-blue-50'} flex items-center justify-center mx-auto mb-6`}>
                  <Info className={`w-10 h-10 ${isNight ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <p className={`text-[20px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'} mb-4`}>Créditos</p>
                <div className="space-y-4">
                  <div>
                    <p className={`text-[12px] font-black uppercase tracking-widest ${isNight ? 'text-white/40' : 'text-[#0f172a]/40'} mb-1`}>Creador Original</p>
                    <p className={`text-[17px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>Samsung Electronics Co., Ltd.</p>
                  </div>
                  
                  <div className={`h-px w-full ${isNight ? 'bg-white/5' : 'bg-gray-100'}`} />
                  
                  <div>
                    <p className={`text-[12px] font-black uppercase tracking-widest ${isNight ? 'text-white/40' : 'text-[#0f172a]/40'} mb-1`}>Desarrollo y Port</p>
                    <p className={`text-[16px] ${isNight ? 'text-white/60' : 'text-[#0f172a]/70'} leading-relaxed font-medium`}>
                      Hecho por @OneUIMaster / <a href="https://www.youtube.com/@gamingnews1844" target="_blank" rel="noopener noreferrer" className={`${isNight ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>@gamingnews1844</a>
                    </p>
                    <p className={`text-[16px] ${isNight ? 'text-white/60' : 'text-[#0f172a]/70'} font-medium mt-1`}>
                      TikTok: <span className={isNight ? 'text-blue-400' : 'text-blue-600'}>@fabri9829</span>
                    </p>
                  </div>

                  <div className={`h-px w-full ${isNight ? 'bg-white/5' : 'bg-gray-100'}`} />

                  <p className={`text-[13px] ${isNight ? 'text-white/30' : 'text-[#0f172a]/40'} font-medium`}>
                    Desarrollado en AI Studios usando Gemini 3.1
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode; iconBg?: string; title: string; onClick: () => void; isLast?: boolean; isNight?: boolean }> = ({ icon, iconBg = "bg-gray-500", title, onClick, isLast, isNight }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-5 ${isNight ? 'active:bg-white/5' : 'active:bg-gray-50'} transition-colors ${!isLast ? (isNight ? 'border-b border-white/5' : 'border-b border-gray-100') : ''}`}>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shadow-sm`}>{icon}</div>
      <span className={`text-[17px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>{title}</span>
    </div>
    <ChevronLeft className={`w-5 h-5 ${isNight ? 'text-white/20' : 'text-gray-400'} rotate-180`} />
  </button>
);

const SettingToggleItem: React.FC<{ icon: React.ReactNode; iconBg?: string; title: string; active: boolean; onToggle: () => void; isLast?: boolean; badge?: string; isNight?: boolean }> = ({ icon, iconBg = "bg-blue-500", title, active, onToggle, isLast, badge, isNight }) => (
  <div className={`flex items-center justify-between px-6 py-5 ${!isLast ? (isNight ? 'border-b border-white/5' : 'border-b border-gray-100') : ''}`}>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shadow-sm relative overflow-hidden`}>
        {active && (
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
        {icon}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`text-[17px] font-bold ${isNight ? 'text-white' : 'text-[#0f172a]'}`}>{title}</span>
          {badge && <span className="bg-[#ff8c00] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">{badge}</span>}
        </div>
      </div>
    </div>
    <button 
      onClick={onToggle} 
      className={`w-14 h-8 rounded-full transition-all relative duration-500 overflow-hidden ${
        active 
          ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
          : (isNight ? 'bg-white/10' : 'bg-gray-300')
      }`}
    >
      {/* Liquid Glass Effect */}
      {active && (
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/40 via-transparent to-white/10 animate-[spin_3s_linear_infinite]" />
        </div>
      )}
      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-lg transform flex items-center justify-center ${active ? 'translate-x-6 rotate-[360deg]' : 'translate-x-0'}`}>
        {active && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />}
      </div>
    </button>
  </div>
);

