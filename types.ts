export type TtsVoice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export enum TimePhase {
  MORNING = 'MORNING',
  DAY = 'DAY',
  EVENING = 'EVENING',
  LATE_NIGHT = 'LATE_NIGHT'
}

export interface WeatherData {
  current: string;
  temp: number;
  feelsLike?: number;
  high: number;
  low: number;
  location: string;
  condition: string;
  sunset: string;
  sunrise?: string;
  comparison: string;
  secondarySummary?: string;
  sourceUrl?: string;
  alert?: { title: string; message: string };
  forecast: { time: string; temp: number; icon: string }[];
}

export interface NewsArticle {
  title: string;
  source: string;
  category: string;
  imageUrl?: string;
  articleUrl?: string;
}

export interface YoutubeVideo {
  title: string;
  channel: string;
  thumbnail: string;
  views: string;
  time: string;
  url?: string;
  videoId?: string;
}

export interface SpotifyItem {
  title: string;
  artist: string;
  thumbnail: string;
  url: string;
}

export interface OccasionData {
  name: string;
  date: string;
  time?: string;
  description?: string;
  isOccasion: boolean;
}

export interface BirthdayConfig {
  enabled: boolean;
  name: string;
  date: string; // YYYY-MM-DD
}

export interface ReminderConfig {
  id: string;
  title: string;
  text: string;
  icon: string;
  time: string; // HH:mm
  enabled: boolean;
}

export type AppMode = 'mobile' | 'pc';

export interface BriefContent {
  greeting: string;
  subtext: string;
  summaryText: string;
  weatherConditionSnippet: string;
  weather: WeatherData;
  youtubeUploads: YoutubeVideo[];
  spotifyItems: SpotifyItem[];
  news: NewsArticle[];
  occasion?: OccasionData;
  breakdown: string[];
  localTime?: string;
  localHour?: number;
  timezone?: string;
}