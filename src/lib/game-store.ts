import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game } from '@/types/nfl';

interface GameStore {
  games: Record<string, Game>;
  lastUpdated: Record<string, number>;
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  getGame: (gameId: string) => Game | undefined;
  setGame: (game: Game) => void;
  setGames: (games: Game[]) => void;

  getGamesWithScores: (games: Game[]) => Game[];

  clearCache: () => void;
  getCacheStats: () => { size: number; oldestEntry: number | null };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      games: {},
      lastUpdated: {},
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      getGame: (gameId: string) => {
        const { games, lastUpdated } = get();
        const timestamp = lastUpdated[gameId];
        if (!timestamp || Date.now() - timestamp > CACHE_DURATION) {
          return undefined;
        }
        return games[gameId];
      },

      setGame: (game: Game) => {
        set((state) => ({
          games: { ...state.games, [game.id]: game },
          lastUpdated: { ...state.lastUpdated, [game.id]: Date.now() }
        }));
      },

      setGames: (games: Game[]) => {
        const now = Date.now();
        set((state) => {
          const newGames = { ...state.games };
          const newLastUpdated = { ...state.lastUpdated };

          games.forEach((game) => {
            newGames[game.id] = game;
            newLastUpdated[game.id] = now;
          });

          return { games: newGames, lastUpdated: newLastUpdated };
        });
      },

      getGamesWithScores: (inputGames: Game[]) => {
        const { games: cachedGames, lastUpdated } = get();
        const now = Date.now();

        const result = inputGames.map((game) => {
          const timestamp = lastUpdated[game.id];
          if (timestamp && now - timestamp < CACHE_DURATION) {
            const cached = cachedGames[game.id];
            if (cached) {
              return cached;
            }
          }
          return game;
        });

        return result;
      },

      clearCache: () => {
        set({ games: {}, lastUpdated: {} });
      },

      getCacheStats: () => {
        const { lastUpdated } = get();
        const entries = Object.values(lastUpdated);
        return {
          size: entries.length,
          oldestEntry: entries.length > 0 ? Math.min(...entries) : null
        };
      }
    }),
    {
      name: 'nfl-game-scores',
      partialize: (state) => ({
        games: state.games,
        lastUpdated: state.lastUpdated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);

