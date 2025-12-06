'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/game-store';
import { SeasonSchedule, GameBoxScore } from '@/types/nfl';

export function GameCacheProvider({ children }: { children: React.ReactNode }) {
  const fetchStartedRef = useRef(false);
  const { getGame, setGame, _hasHydrated, getCacheStats } = useGameStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    async function fetchAndCacheGames() {
      try {
        const response = await fetch('/api/nfl/schedule/season');
        if (!response.ok) return;

        const data: SeasonSchedule = await response.json();
        const allGames = data.weeks.flatMap((week) => week.games || []);

        const completedGames = allGames.filter(
          g => (g.status === 'complete' || g.status === 'closed') && !getGame(g.id)
        );

        if (completedGames.length === 0) {
          return;
        }

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        let consecutiveErrors = 0;

        for (let i = 0; i < completedGames.length; i++) {
          const game = completedGames[i];

          try {
            if (i > 0) await delay(300);

            const response = await fetch(`/api/nfl/games/${game.id}/boxscore`);

            if (response.ok) {
              consecutiveErrors = 0;
              const boxscore: GameBoxScore = await response.json();
              const awayPoints = boxscore.summary?.away?.points ?? boxscore.away?.points;
              const homePoints = boxscore.summary?.home?.points ?? boxscore.home?.points;

              if (awayPoints !== undefined && homePoints !== undefined) {
                setGame({
                  ...game,
                  away: { ...game.away, points: awayPoints },
                  home: { ...game.home, points: homePoints }
                });
              }
            } else if (response.status === 429) {
              consecutiveErrors++;
              await delay(5000);
              i--;
              if (consecutiveErrors >= 3) break;
            } else {
              consecutiveErrors++;
              if (consecutiveErrors >= 3) break;
            }
          } catch {
            consecutiveErrors++;
            if (consecutiveErrors >= 3) break;
          }
        }

      } catch (err) {
        console.error('Error fetching and caching games:', err);
      }
    }

    fetchAndCacheGames();
  }, [_hasHydrated, getGame, setGame, getCacheStats]);

  return <>{children}</>;
}

