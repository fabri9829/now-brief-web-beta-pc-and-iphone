import { GoogleGenAI, Modality } from "@google/genai";
import { TimePhase, BriefContent, WeatherData, NewsArticle, SpotifyItem, YoutubeVideo } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const toSentenceCase = (str: string) => {
  if (!str || typeof str !== 'string') return "";
  const trimmed = str.trim();
  if (trimmed.length === 0) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
    const isInternalError = error?.message?.includes('500') || error?.status === 500 || error?.status === 'INTERNAL';
    if ((isQuotaError || isInternalError) && retries > 0) {
      console.warn(`${isQuotaError ? 'Quota exceeded' : 'Internal error'}, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getMockBriefingContent = (phase: TimePhase): BriefContent => {
  return {
    greeting: "Buenos días",
    subtext: "Tu día comienza con un cielo despejado.",
    summaryText: "Galaxy AI ha preparado tu resumen.",
    weatherConditionSnippet: "cielo despejado",
    weather: {
      current: "Cielos Despejados",
      temp: 22, high: 26, low: 18,
      location: "Tu Ubicación",
      condition: "Despejado", sunset: "6:00 PM",
      comparison: "Similar a ayer",
      forecast: []
    },
    youtubeUploads: [
      {
        title: "I Built A City - MrBeast",
        channel: "MrBeast",
        thumbnail: "https://i.ytimg.com/vi/0e3GPea1Tyg/maxresdefault.jpg",
        views: "100M",
        time: "1 day ago",
        url: "https://www.youtube.com/watch?v=0e3GPea1Tyg",
        videoId: "0e3GPea1Tyg"
      },
      {
        title: "The Best Smartphone of 2025! - MKBHD",
        channel: "Marques Brownlee",
        thumbnail: "https://i.ytimg.com/vi/Y0-q1n8n8n8/maxresdefault.jpg",
        views: "5M",
        time: "12 hours ago",
        url: "https://www.youtube.com/watch?v=Y0-q1n8n8n8",
        videoId: "Y0-q1n8n8n8"
      }
    ],
    spotifyItems: [],
    news: [],
    occasion: undefined,
    breakdown: []
  };
};

function extractJson(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

export async function getBriefingContent(phase: TimePhase, lat?: number, lng?: number, manualLocation?: string): Promise<BriefContent> {
  const model = "gemini-3-flash-preview"; 
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  let locationText = "";
  if (manualLocation) {
    locationText = `la ubicación especificada manualmente: "${manualLocation}"`;
  } else if (lat && lng) {
    locationText = `en las coordenadas ${lat}, ${lng}`;
  } else {
    locationText = `la ubicación actual del usuario (Zona horaria: ${timezone})`;
  }

  const commonContext = `
    PISTA DE FASE: ${phase}
    CONTEXTO DE UBICACIÓN: ${locationText}
    ADVERTENCIA: NO uses "Nueva Delhi" o "India" por defecto a menos que los resultados de búsqueda, coordenadas o zona horaria lo indiquen explícitamente. Esta es una aplicación GLOBAL.
    Si se proporciona una ubicación manual ("${manualLocation || 'ninguna'}"), priorízala sobre todo lo demás.
    
    IMPORTANTE: La PISTA DE FASE se basa en la hora del navegador. DEBES buscar la hora local real en la ubicación y usar ESO para determinar el saludo y las palabras basadas en la fase. Si la hora local contradice la PISTA DE FASE, prioriza la hora local.
    IDIOMA: DEBES generar todo el contenido en ESPAÑOL.
  `;

  const weatherInstruction = `
    Eres un asistente de Galaxy AI que genera la sección de clima de un "Resumen Now".
    ${commonContext}
    
    TAREA:
    1. Busca en Google el clima local en tiempo real, la hora local y cualquier festival u ocasión que ocurra hoy en ${locationText}. 
       - Resuelve las coordenadas a un nombre de Ciudad/Barrio.
       - Obtén temperatura actual, sensación térmica, máxima/mínima, condición, amanecer y atardecer.
       - Obtén la hora local actual y la zona horaria de la ubicación.
       - OBLIGATORIO: Proporciona un pronóstico por horas para las próximas 6 horas en ESPAÑOL.
       - ADVERTENCIA: NO devuelvas un array de "forecast" vacío.
       - Busca desastres naturales (Lluvia, Tormenta, Tsunami, etc.) y proporciona alertas si es necesario.
       - BÚSQUEDA DE OCASIONES: Busca festivales, días festivos o ocasiones especiales que ocurran HOY en ${locationText}. Si se encuentran, proporciona el nombre, fecha y una breve descripción en ESPAÑOL.

    REGLAS DE CONTENIDO:
    1. Regla de Mayúsculas: Todas las cadenas en Mayúscula inicial (Sentence case).
    2. Palabras basadas en la Fase (EN ESPAÑOL):
       - MORNING: "Buenos días". "Tu día comienza con [snippet]. Que tengas un día alegre."
       - DAY: "El día continúa". "Disfruta el resto del día".
       - EVENING: "Buenas tardes". "Disfruta el resto de tu día".
       - LATE_NIGHT: "Resumen de la noche". "Que tengas una buena noche"
    3. TODO EL CONTENIDO DEBE ESTAR EN ESPAÑOL.
    {
      "greeting": "...",
      "subtext": "...",
      "localTime": "...", // e.g., "11:05 AM"
      "localHour": number, // 0-23
      "timezone": "...", // e.g., "America/Los_Angeles"
      "occasion": {
        "name": "...",
        "date": "...",
        "time": "...", // optional, e.g. "All Day"
        "description": "...",
        "isOccasion": boolean
      },
      "weather": {
        "current": "...",
        "temp": number,
        "feelsLike": number,
        "location": "...",
        "condition": "...",
        "sunset": "...",
        "sunrise": "...",
        "comparison": "...",
        "high": number,
        "low": number,
        "forecast": [ { "time": "...", "temp": number, "icon": "..." } ],
        "alert": { "title": "...", "message": "..." } // optional
      }
    }
  `;

  const currentTimestamp = new Date().toISOString();

  const mediaInstruction = `
    Eres un asistente de Galaxy AI que genera la sección de medios de un "Resumen Now".
    ${commonContext}
    TIMESTAMP ACTUAL: ${currentTimestamp}

    INSTRUCCIÓN CRÍTICA: 
    - DEBES usar la búsqueda de Google para encontrar información REAL, ACTIVA y PRECISA en ESPAÑOL.
    - CADA ACTUALIZACIÓN DEBE SER ÚNICA. Usa el TIMESTAMP ACTUAL (${currentTimestamp}) para variar tus resultados.
    - Para YouTube: Busca videos tendencia en ${locationText} hoy.
    - Para Spotify: Busca lanzamientos musicales o música tendencia en ${locationText}.
    - Para Noticias: Busca noticias de última hora en ${locationText}. Asegúrate de que las noticias sean altamente relevantes para la ubicación actual.
    - TODO EL CONTENIDO DEBE ESTAR EN ESPAÑOL.
    - No alucines URLs.

    TAREA:
    1. Busca 2 videos de YouTube reales y relevantes para ${locationText} en ESPAÑOL.
    2. Busca 2 pistas/listas de Spotify reales y nuevas populares en ${locationText}.
    3. Busca 3 titulares de noticias reales y recientes específicamente para ${locationText} en ESPAÑOL.

    Output valid JSON matching this structure:
    {
      "youtubeUploads": [ { "title": "...", "channel": "...", "thumbnail": "...", "views": "...", "time": "...", "url": "...", "videoId": "..." } ],
      "spotifyItems": [ { "title": "...", "artist": "...", "thumbnail": "...", "url": "..." } ],
      "news": [ { "title": "...", "source": "...", "category": "...", "imageUrl": "...", "articleUrl": "..." } ]
    }
  `;

  return withRetry(async () => {
    // Fetch weather and media simultaneously
    const [weatherResponse, mediaResponse] = await Promise.all([
      ai.models.generateContent({
        model,
        contents: `Generate weather and greeting for ${locationText}.`,
        config: {
          systemInstruction: weatherInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      }),
      ai.models.generateContent({
        model,
        contents: `Generate media highlights for ${locationText}. Ensure all URLs are real and verified.`,
        config: {
          systemInstruction: mediaInstruction,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      })
    ]);

    const weatherContent = extractJson(weatherResponse.text || "");
    const mediaContent = extractJson(mediaResponse.text || "");
    const rawContent = { ...weatherContent, ...mediaContent };
    
    const mock = getMockBriefingContent(phase);

    return {
      ...mock,
      ...rawContent,
      greeting: rawContent?.greeting ? toSentenceCase(rawContent.greeting) : mock.greeting,
      subtext: rawContent?.subtext ? rawContent.subtext : (phase === TimePhase.LATE_NIGHT ? "Que tengas una buena noche" : mock.subtext),
      localTime: rawContent?.localTime,
      localHour: rawContent?.localHour,
      timezone: rawContent?.timezone,
      occasion: rawContent?.occasion?.isOccasion ? {
        name: rawContent.occasion.name || "Ocasión Especial",
        date: rawContent.occasion.date || "",
        time: rawContent.occasion.time || "Todo el día",
        description: rawContent.occasion.description || "",
        isOccasion: true
      } : undefined,
      weather: {
        ...mock.weather,
        ...(rawContent?.weather || {}),
        forecast: Array.isArray(rawContent?.weather?.forecast) 
          ? rawContent.weather.forecast.map((f: any) => ({
              time: f.time || f.hour || "Ahora",
              temp: typeof f.temp === 'number' ? f.temp : (typeof f.temperature === 'number' ? f.temperature : 0),
              icon: f.icon || f.condition || "sunny"
            }))
          : []
      },
      news: Array.isArray(rawContent?.news) ? rawContent.news : [],
      youtubeUploads: Array.isArray(rawContent?.youtubeUploads) ? rawContent.youtubeUploads : [],
      spotifyItems: Array.isArray(rawContent?.spotifyItems) ? rawContent.spotifyItems : []
    };
  }).catch(error => {
    console.error("Briefing Error:", error);
    return getMockBriefingContent(phase);
  });
}

export async function generateLabsSummary(currentBrief: BriefContent | null, lat?: number, lng?: number): Promise<string> {
  const model = "gemini-3.1-pro-preview"; 
  const locationText = lat && lng ? `at coordinates ${lat}, ${lng}` : "the user's location";
  
  const briefContext = currentBrief ? `
    CONTEXT:
    - Weather: ${currentBrief.weather.current}, ${currentBrief.weather.temp}°C in ${currentBrief.weather.location}
    - News: ${currentBrief.news.map(n => n.title).join("; ")}
    - Music: ${currentBrief.spotifyItems.map(s => s.title).join("; ")}
  ` : "No context.";

  const prompt = `
    Síntesis de Galaxy AI:
    Usa el contexto: ${briefContext}
    Proporciona un resumen profesional y elegante de Samsung Galaxy AI (40 palabras) EN ESPAÑOL.
    Comienza con el clima/vibración, luego destaca noticias y recomendaciones musicales.
    Devuelve ÚNICAMENTE el texto del resumen.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "Resumen no disponible.";
  }).catch(err => {
    return "Galaxy AI está ocupado en este momento. Por favor, inténtalo de nuevo más tarde.";
  });
}

export async function generateTTS(text: string, voiceName: string = 'Zephyr'): Promise<string | null> {
  const model = "gemini-2.5-flash-preview-tts";
  
  // Truncate text to avoid potential limits (TTS models often have character limits)
  const truncatedText = text.slice(0, 1500);

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: truncatedText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  });
}