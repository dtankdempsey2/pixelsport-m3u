/**
 * api/playlist.js
 * Vercel serverless function to generate PixelSport M3U8 playlist on-the-fly
 */

const BASE = "https://pixelsport.tv";
const API_EVENTS = `${BASE}/backend/liveTV/events`;

// VLC-style options
const VLC_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0";
const VLC_REFERER = `${BASE}/`;
const VLC_ICY = "1";

// Cache configuration
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
let cachedData = null;
let cacheTimestamp = null;

// Timezone abbreviations mapping
const TIMEZONE_ABBR = {
  '-5': 'ET',
  '-4': 'ET',
  '-6': 'CT',
  '-7': 'MT',
  '-8': 'PT',
  '0': 'UTC',
  '1': 'CET'
};

/**
 * Convert ISO UTC time string to specified timezone
 * @param {string} utcStr - ISO UTC time string
 * @param {number} offsetHours - Timezone offset in hours (e.g., -5 for ET, -8 for PT)
 * @returns {string} Formatted time string
 */
function utcToTimezone(utcStr, offsetHours = -5) {
  try {
    const utcDate = new Date(utcStr);
    
    // For ET, handle DST (EDT = UTC-4, EST = UTC-5)
    let actualOffset = offsetHours;
    if (offsetHours === -5) {
      const month = utcDate.getUTCMonth() + 1;
      actualOffset = (month >= 3 && month <= 11) ? -4 : -5;
    }
    
    const localDate = new Date(utcDate.getTime() + actualOffset * 60 * 60 * 1000);
    
    // Get timezone abbreviation
    const tzAbbr = TIMEZONE_ABBR[actualOffset.toString()] || `UTC${actualOffset >= 0 ? '+' : ''}${actualOffset}`;
    
    // Format: "HH:MM AM/PM TZ - MM/DD/YYYY"
    const hours = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    const month_str = (localDate.getUTCMonth() + 1).toString();
    const day = localDate.getUTCDate().toString();
    const year = localDate.getUTCFullYear();
    
    return `${displayHours}:${minutes} ${ampm} ${tzAbbr} - ${month_str}/${day}/${year}`;
  } catch (error) {
    return "";
  }
}

/**
 * Fetch JSON data from API using AllOrigins proxy to bypass blocking
 * Uses in-memory cache with 2 hour TTL
 * This is only for the PixelSport events API, not the stream URLs
 */
async function fetchJson(url) {
  const now = Date.now();
  
  // Check if cache is valid
  if (cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    console.log(`[+] Using cached data (age: ${Math.round((now - cacheTimestamp) / 1000 / 60)} minutes)`);
    return cachedData;
  }
  
  console.log("[*] Cache miss or expired, fetching fresh data...");
  
  // Use AllOrigins proxy to bypass Vercel IP blocking for the API call
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(proxyUrl, {
    headers: {
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(15000), // 15 second timeout
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // AllOrigins returns the content in data.contents
  if (!data.contents) {
    throw new Error("No content returned from proxy");
  }
  
  const parsedData = JSON.parse(data.contents);
  
  // Update cache
  cachedData = parsedData;
  cacheTimestamp = now;
  console.log("[+] Cache updated");
  
  return parsedData;
}

/**
 * Collect valid stream URLs from an event
 */
function collectLinks(event) {
  const links = [];
  
  for (let i = 1; i <= 3; i++) {
    const key = `server${i}URL`;
    try {
      const link = event.channel?.[key];
      if (link && link.toLowerCase() !== "null") {
        links.push(link);
      }
    } catch (error) {
      continue;
    }
  }
  
  return links;
}

/**
 * Generate M3U8 playlist text with headers based on player type
 * Stream URLs are NOT proxied - they use direct URLs with player-specific headers
 * @param {Array} events - Array of event objects
 * @param {number} timezoneOffset - Timezone offset in hours
 * @param {string} playerType - Player type: 'vlc', 'kodi', or 'tivimate'
 */
function buildM3u(events, timezoneOffset = -5, playerType = 'vlc') {
  const lines = ["#EXTM3U"];
  
  for (const ev of events) {
    let title = (ev.match_name || "Unknown Event").trim();
    const logo = ev.competitors1_logo || "";
    const dateStr = ev.date;
    
    const timeFormatted = utcToTimezone(dateStr, timezoneOffset);
    if (timeFormatted) {
      title = `${title} - ${timeFormatted}`;
    }
    
    // Use league name from API if available
    const league = ev.channel?.TVCategory?.name || "LIVE";
    
    const links = collectLinks(ev);
    
    for (const link of links) {
      lines.push(`#EXTINF:-1 tvg-logo="${logo}" group-title="${league}",${title}`);
      
      // Add player-specific headers
      switch (playerType.toLowerCase()) {
        case 'kodi':
          // Kodi uses #KODIPROP format
          lines.push(`#KODIPROP:inputstream=inputstream.adaptive`);
          lines.push(`#KODIPROP:inputstream.adaptive.manifest_type=hls`);
          lines.push(`#KODIPROP:inputstream.adaptive.stream_headers=User-Agent=${encodeURIComponent(VLC_USER_AGENT)}&Referer=${encodeURIComponent(VLC_REFERER)}`);
          lines.push(link);
          break;
          
        case 'tivimate':
          // TiviMate uses pipe notation: URL|User-Agent=...|Referer=...
          lines.push(`${link}|User-Agent=${VLC_USER_AGENT}|Referer=${VLC_REFERER}`);
          break;
          
        case 'vlc':
        default:
          // VLC uses #EXTVLCOPT format (default)
          lines.push(`#EXTVLCOPT:http-user-agent=${VLC_USER_AGENT}`);
          lines.push(`#EXTVLCOPT:http-referrer=${VLC_REFERER}`);
          lines.push(`#EXTVLCOPT:http-icy-metadata=${VLC_ICY}`);
          lines.push(link);
          break;
      }
    }
  }
  
  return lines.join("\n");
}

/**
 * Main Vercel serverless function handler
 * Query params:
 *   - tz: Timezone offset in hours (default: -5 for ET)
 *         Examples: -5 (ET), -6 (CT), -7 (MT), -8 (PT), 0 (UTC)
 *   - type: Player type - 'vlc' (default), 'kodi', or 'tivimate'
 *   - nocache: Set to '1' to bypass cache (for testing)
 */
export default async function handler(req, res) {
  try {
    // Get timezone offset from query parameter, default to -5 (ET)
    const tzParam = req.query.tz;
    let timezoneOffset = -5; // Default to ET
    
    if (tzParam !== undefined) {
      const parsedTz = parseFloat(tzParam);
      if (!isNaN(parsedTz) && parsedTz >= -12 && parsedTz <= 14) {
        timezoneOffset = parsedTz;
      }
    }
    
    // Get player type from query parameter, default to 'vlc'
    const playerType = req.query.type || 'vlc';
    const validTypes = ['vlc', 'kodi', 'tivimate'];
    const finalPlayerType = validTypes.includes(playerType.toLowerCase()) ? playerType.toLowerCase() : 'vlc';
    
    // Allow cache bypass for testing
    if (req.query.nocache === '1') {
      console.log("[*] Cache bypass requested");
      cachedData = null;
      cacheTimestamp = null;
    }
    
    console.log(`[*] Fetching PixelSport live events (timezone: ${timezoneOffset}, player: ${finalPlayerType})…`);
    
    const data = await fetchJson(API_EVENTS);
    const events = data.events || [];
    
    if (events.length === 0) {
      console.log("[-] No live events found.");
      return res.status(200)
        .setHeader("Content-Type", "application/vnd.apple.mpegurl")
        .setHeader("Content-Disposition", 'attachment; filename="pixelsport.m3u8"')
        .send("#EXTM3U\n# No live events currently available");
    }
    
    const playlist = buildM3u(events, timezoneOffset, finalPlayerType);
    
    const cacheAge = cacheTimestamp ? Math.round((Date.now() - cacheTimestamp) / 1000 / 60) : 0;
    console.log(`[+] Generated playlist with ${events.length} events (cache age: ${cacheAge} min, type: ${finalPlayerType})`);
    
    // Return M3U8 playlist with appropriate headers
    res.status(200)
      .setHeader("Content-Type", "application/vnd.apple.mpegurl")
      .setHeader("Content-Disposition", 'attachment; filename="pixelsport.m3u8"')
      .setHeader("Cache-Control", "public, max-age=60") // Cache for 1 minute
      .setHeader("X-Cache-Age", `${cacheAge}`) // Custom header showing cache age in minutes
      .setHeader("X-Player-Type", finalPlayerType) // Show which player type was used
      .send(playlist);
      
  } catch (error) {
    console.error(`[!] Error: ${error.message}`);
    
    res.status(500)
      .setHeader("Content-Type", "text/plain")
      .send(`Error generating playlist: ${error.message}`);
  }
}
