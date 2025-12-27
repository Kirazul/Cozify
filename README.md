<p align="center">
  <img src="public/LOGO.png" alt="Cozify Logo" width="150">
</p>
<p align="center">
Cozify
</p>
A modern anime streaming web application built with React. Cozify provides a seamless viewing experience with an elegant interface, custom HLS video player, and comprehensive user tracking features.

![Home Page](screenshots/home.png)

---

## Demo

Live Demo: [https://kirazul.github.io/Cozify/](https://kirazul.github.io/Cozify/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Screenshots](#screenshots)
- [License](#license)

---

## Overview

Cozify is a single-page application designed for anime enthusiasts. It aggregates anime content through the YumaAPI, providing access to a vast library of anime series with both subbed and dubbed options. The application features a custom HLS video player with subtitle support, quality selection, and a dedicated backend proxy for CORS-free streaming.

---

## Features

### Core Functionality
- Browse trending, top airing, and recently updated anime
- Search anime with real-time suggestions
- View detailed anime information including synopsis, rating, and episode list
- Stream episodes with SUB/DUB audio options
- Daily airing schedule

### Video Player
- Custom HLS.js-based player with full controls
- Subtitle support with multiple language options (auto-selects English)
- Quality selection (Auto, 1080p, 720p, 360p)
- Playback speed control (0.25x to 2x)
- Instant seeking with visual feedback
- Keyboard shortcuts:
  - Space/K: Play/Pause
  - F: Fullscreen
  - M: Mute
  - N: Next episode
  - P: Previous episode
  - Arrow keys: Seek 10 seconds

### User Profile System
- Welcome modal for first-time visitors
- Watch history tracking with continue watching feature
- Episode completion tracking (marks watched after 1 minute)
- Real-time watch time statistics
- Trophy achievement system with 4 tiers (Bronze, Silver, Gold, Platinum)
- Visual indicators for watched episodes

### Design
- Dark theme with signature pink accent (#ffbade)
- Glassmorphism UI elements
- Responsive layout for all screen sizes
- Smooth animations and transitions

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| React Router DOM 6 | Client-side routing |
| Vite 5 | Build tool and dev server |
| HLS.js | HTTP Live Streaming support |
| CSS3 | Styling with custom properties |
| LocalStorage | Client-side data persistence |
| Deno Deploy | Backend proxy server |

---

## Architecture

Cozify uses a two-tier architecture:

### Frontend (GitHub Pages)
- React SPA hosted on GitHub Pages
- Communicates with the backend proxy for all streaming data

### Backend Proxy (Deno Deploy)
- Hosted at `https://cozify-api.deno.dev`
- Proxies YumaAPI requests to bypass CORS
- Rewrites HLS playlist URLs for seamless streaming
- Proxies subtitle VTT files for cross-origin access

---

## API Reference

Cozify uses a custom Deno Deploy backend that proxies the YumaAPI.

### Backend Base URL
```
https://cozify-api.deno.dev
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/search/{query}` | Search anime by title |
| `/api/info/{anime_id}` | Get detailed anime information and episode list |
| `/watch?episodeId={id}&type={sub\|dub}` | Get proxied video streaming sources |
| `/stream?url={m3u8_url}` | Proxy HLS streams with CORS headers |
| `/subtitle?url={vtt_url}` | Proxy subtitle files |
| `/api/recent-episodes` | Fetch recently updated episodes |
| `/api/top-airing` | Get current top airing anime |
| `/api/spotlight` | Get featured spotlight anime |
| `/api/genre/{genre_name}` | Get anime by genre |
| `/api/schedule/{YYYY-MM-DD}` | Get airing schedule for a date |

### Video Streaming Flow
1. Frontend requests `/watch` with episode ID
2. Backend fetches sources from YumaAPI
3. Backend rewrites source URLs to go through `/stream` proxy
4. HLS.js loads the proxied m3u8 playlist
5. All segment requests are automatically proxied

---

## Project Structure

```
cozify/
├── public/
│   └── anw-min.webp          # Background image asset
├── src/
│   ├── api/
│   │   └── index.js          # API service layer
│   ├── components/
│   │   ├── Header.jsx        # Navigation header
│   │   ├── VideoPlayer.jsx   # Custom HLS player with settings
│   │   ├── VideoPlayer.css   # Player styles
│   │   ├── AnimeCard.jsx     # Anime card component
│   │   ├── TrendingCarousel.jsx
│   │   ├── TopTen.jsx
│   │   └── WelcomeModal.jsx  # First-visit welcome modal
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── Browse.jsx        # Browse/search page
│   │   ├── Anime.jsx         # Anime detail page
│   │   ├── Watch.jsx         # Video watch page
│   │   ├── Schedule.jsx      # Airing schedule
│   │   └── Profile.jsx       # User profile and stats
│   ├── services/
│   │   └── userService.js    # LocalStorage user data management
│   ├── styles/
│   │   └── global.css        # Global styles and CSS variables
│   ├── App.jsx               # Root component with routes
│   └── main.jsx              # Application entry point
├── index.html
├── package.json
└── vite.config.js

cozify-server/
├── main.ts                   # Deno Deploy backend
└── deno.json                 # Deno configuration
```

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Kirazul/Cozify.git
cd cozify
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## Screenshots

### Browse Page
Search and filter anime by genre, with grid layout display.

![Browse Page](screenshots/browse.png)

### Watch Page
Full-featured video player with episode grid, anime info panel, and playback controls.

![Watch Page](screenshots/watch.png)

### Profile Page
User statistics, watch history, continue watching section, and trophy achievements.

![Profile Page](screenshots/profile.png)

---

## Configuration

### Vite Configuration
The project uses Vite with React plugin. The base path is configured for GitHub Pages deployment.

### Color Scheme
Primary accent color: `#ffbade` (Pink)
Background: Dark theme with glassmorphism effects

---

## License

This project is for educational purposes only. All anime content is provided through third-party APIs and streaming services.

---

## Acknowledgments

- YumaAPI for providing the anime data API
- HiAnime.to as the data source
- Deno Deploy for backend hosting
