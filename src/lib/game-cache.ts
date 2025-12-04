import { Game } from "@/types/nfl";

interface CachedGame {
  game: Game;
  timestamp: number;
}

interface GameCache {
  [gameId: string]: CachedGame;
}

const CACHE_KEY = "nfl-game-scores-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function getCachedGames(): Map<string, Game> {
  if (typeof window === "undefined") return new Map();

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return new Map();

    const cache: GameCache = JSON.parse(cached);
    const now = Date.now();
    const result = new Map<string, Game>();

    Object.entries(cache).forEach(([gameId, cachedGame]) => {
      if (now - cachedGame.timestamp < CACHE_DURATION) {
        result.set(gameId, cachedGame.game);
      }
    });

    console.log("💾 [Cache] Loaded", result.size, "cached games");
    return result;
  } catch (err) {
    console.error("💾 [Cache] Error loading cache:", err);
    return new Map();
  }
}

export function cacheGame(gameId: string, game: Game): void {
  if (typeof window === "undefined") return;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cache: GameCache = cached ? JSON.parse(cached) : {};

    cache[gameId] = {
      game,
      timestamp: Date.now()
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log("💾 [Cache] Cached game:", game.away.alias, "vs", game.home.alias);
  } catch (err) {
    console.error("💾 [Cache] Error saving to cache:", err);
  }
}

export function cacheMultipleGames(games: Map<string, Game>): void {
  if (typeof window === "undefined") return;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cache: GameCache = cached ? JSON.parse(cached) : {};
    const now = Date.now();

    games.forEach((game, gameId) => {
      cache[gameId] = {
        game,
        timestamp: now
      };
    });

    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log("💾 [Cache] Cached", games.size, "games");
  } catch (err) {
    console.error("💾 [Cache] Error saving multiple games:", err);
  }
}

export function clearCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEY);
  console.log("💾 [Cache] Cleared cache");
}

export function getCacheStats(): { size: number; oldestEntry: number | null } {
  if (typeof window === "undefined") return { size: 0, oldestEntry: null };

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return { size: 0, oldestEntry: null };

    const cache: GameCache = JSON.parse(cached);
    const entries = Object.values(cache);

    return {
      size: entries.length,
      oldestEntry: entries.length > 0
        ? Math.min(...entries.map(e => e.timestamp))
        : null
    };
  } catch {
    return { size: 0, oldestEntry: null };
  }
}

