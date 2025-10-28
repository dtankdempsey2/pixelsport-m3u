# ⚽ PixelSport M3U8 Playlist Generator (Vercel)

This is a **Node.js serverless function** that generates PixelSport M3U8 playlists.

## ✨ Features

* ⚡ **On-demand generation**: Playlist is generated on each request and then cached for 2 hours.
* ☁️ **Serverless**: Runs on Vercel's edge network
* 🖥️ **Multi-player support**: VLC, Kodi, and TiviMate compatible with proper header formats
* 🕒 **Timezone support**: Converts UTC times to Eastern Time with DST handling
* 📡 **Multiple stream sources**: Collects all available server URLs per event

---

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dtankdempsey2/pixelsport-m3u)

---

### 🌐 Hosted Version

Looking to try it out right away?
Use the hosted version here:

> [https://pixelsport-m3u.vercel.app/](https://pixelsport-m3u.vercel.app/)

📌 This is a public deployment of the PixelSport M3U playlist generator, hosted on Vercel.

🕑 Responses are cached for **2 hours** to reduce API load while keeping data reasonably fresh.

> ✅ For full control, clone and deploy your own version using the **Deploy to Vercel** button above.

---

## 🧪 Usage

Once deployed, you can access your playlist at:

> [https://your-project.vercel.app/playlist.m3u8](https://your-project.vercel.app/playlist.m3u8)

Or simply:

> [https://your-project.vercel.app](https://your-project.vercel.app)

### 🎮 Player Type Parameter

By default, the playlist uses **VLC** header format. You can customize for different players using the `type` parameter:

```
https://your-project.vercel.app/?type=vlc       # VLC Media Player (default)
https://your-project.vercel.app/?type=kodi      # Kodi
https://your-project.vercel.app/?type=tivimate  # TiviMate
```

**Header formats used:**
- **VLC**: `#EXTVLCOPT` directives
- **Kodi**: `#KODIPROP` with inputstream.adaptive
- **TiviMate**: Pipe notation (`URL|User-Agent=...&Referer=...`)

### 🧭 Timezone Parameter

By default, times are displayed in **Eastern Time (ET)**. You can customize the timezone using the `tz` parameter:

```
https://your-project.vercel.app/?tz=-5   # Eastern Time (default)
https://your-project.vercel.app/?tz=-6   # Central Time
https://your-project.vercel.app/?tz=-7   # Mountain Time
https://your-project.vercel.app/?tz=-8   # Pacific Time
https://your-project.vercel.app/?tz=0    # UTC
https://your-project.vercel.app/?tz=1    # Central European Time
```

Valid timezone offsets: `-12` to `+14`.

### 🔗 Combining Parameters

You can combine both parameters:

```
https://your-project.vercel.app/?type=kodi&tz=-8   # Kodi format with Pacific Time
https://your-project.vercel.app/?type=tivimate&tz=-6  # TiviMate format with Central Time
```


## 🎥 How to Use in Apps

### 📺 VLC Media Player

1. Open VLC
2. Go to `Media → Open Network Stream`
3. Paste your Vercel URL (or add `?type=vlc`)
4. Hit **Play**

### 🎬 Kodi

1. Add playlist source in your IPTV addon
2. Use URL with `?type=kodi` parameter
3. The playlist will use `#KODIPROP` format for proper playback

### 📱 TiviMate

1. Add playlist in TiviMate settings
2. Use URL with `?type=tivimate` parameter
3. The playlist will use `#EXTHTTP` format with proper headers

### 📺 IPTV Apps

Use the URL in any M3U8-compatible IPTV app as your playlist source.

---

## ⚙️ Configuration

The playlist includes:

* 📆 Event names and start times
* 🖼️ Event logos
* 🏆 League/category grouping
* 🎛️ Player-specific HTTP headers for compatibility

### Cache Settings

The events data is cached in-memory for **2 hours** to:
- Reduce load on the PixelSport API
- Minimize proxy usage
- Speed up subsequent requests

The cache is per-serverless-function-instance, so if Vercel scales up multiple instances, each will have its own cache.

---

## 🧊 Cache

The serverless function caches events data for **2 hours** to reduce API and proxy load. The HTTP response is cached for 60 seconds by CDN/browsers.

---

## 📁 File Structure

```
.
├── api/
│   └── playlist.js       # Main serverless function
├── vercel.json           # Vercel configuration
├── package.json          # Node.js dependencies
└── README.md            # This file
```

---

## 🛠️ Local Development

Run locally with Vercel dev server:

```bash
npm install
vercel dev
```

Then access at `http://localhost:3000`

---

## 🛠️ Troubleshooting

* ❌ **No events showing**: The PixelSport API may not have any live events right now.
* ❗ **Streams not playing**: Make sure the source URLs are valid and try a different `type` parameter.
* 🧱 **Deployment fails**: Double-check your Vercel account or CLI authentication.
* 🔧 **Wrong headers**: Verify you're using the correct `type` parameter for your player.

---

## 📝 License

MIT
