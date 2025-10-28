## ⚽ PixelSport M3U8 Playlist Generator (Vercel)

This is a **Node.js serverless function** that generates PixelSport M3U8 playlists **on-the-fly** when requested.

## ✨ Features

* ⚡ **On-demand generation**: Playlist is generated fresh on each request
* ☁️ **Serverless**: Runs on Vercel's edge network
* 🖥️ **VLC compatible**: Uses `EXTVLCOPT` directives for proper streaming
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

### 🧭 Timezone Parameter

By default, times are displayed in **Eastern Time (ET)**. You can customize the timezone using the `tz` parameter:

[https://your-project.vercel.app/?tz=-5](https://your-project.vercel.app/?tz=-5)

## Eastern Time (default)

[https://your-project.vercel.app/?tz=-6](https://your-project.vercel.app/?tz=-6)

## Central Time

[https://your-project.vercel.app/?tz=-7](https://your-project.vercel.app/?tz=-7)

## Mountain Time

[https://your-project.vercel.app/?tz=-8](https://your-project.vercel.app/?tz=-8)

## Pacific Time

[https://your-project.vercel.app/?tz=0](https://your-project.vercel.app/?tz=0)

## UTC

[https://your-project.vercel.app/?tz=1](https://your-project.vercel.app/?tz=1)

## Central European Time

Valid timezone offsets: `-12` to `+14`.

---

## 🎥 How to Use in Apps

### 📺 VLC Media Player

1. Open VLC
2. Go to `Media → Open Network Stream`
3. Paste your Vercel URL
4. Hit **Play**

### 📱 IPTV Apps

Use the URL in any M3U8-compatible IPTV app as your playlist source.

---

## 🗂️ File Structure

.
├── api/
│ └── playlist.js # Main serverless function
├── vercel.json # Vercel configuration
├── package.json # Node.js dependencies
└── README.md # This file

---

## ⚙️ Configuration

The playlist includes:

* 📆 Event names and start times
* 🖼️ Event logos
* 🏆 League/category grouping
* 🎛️ VLC HTTP headers (`EXTVLCOPT`) for compatibility

---

## 🧊 Cache

Responses are cached for **2 hours** to reduce API load and keep content fresh.

---

## 🛠️ Troubleshooting

* ❌ **No events showing**: The PixelSport API may not have any live events right now.
* ❗ **Streams not playing**: Make sure the source URLs are valid.
* 🧱 **Deployment fails**: Double-check your Vercel account or CLI authentication.