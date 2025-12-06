"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { GameCard } from "@/components/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game, WeekSchedule, GameBoxScore } from "@/types/nfl";
import { useGameStore } from "@/lib/game-store";

export default function GamesPage() {
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [allWeeksData, setAllWeeksData] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingScores, setLoadingScores] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const [upcomingVisible, setUpcomingVisible] = useState(10);
  const [completedVisible, setCompletedVisible] = useState(10);

  const upcomingObserverRef = useRef<HTMLDivElement>(null);
  const completedObserverRef = useRef<HTMLDivElement>(null);
  const fetchStartedRef = useRef(false);

  const { getGame, setGame, getGamesWithScores, getCacheStats } = useGameStore();

  useEffect(() => {
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    const abortController = new AbortController();

    async function fetchSchedule() {
      try {
        setLoading(true);

        const currentWeekResponse = await fetch("/api/nfl/schedule/week", { signal: abortController.signal });
        if (!currentWeekResponse.ok) {
          throw new Error("Failed to fetch schedule");
        }
        const currentWeekData: WeekSchedule = await currentWeekResponse.json();
        setSchedule(currentWeekData);

        const currentWeekNum = currentWeekData.week.sequence;
        const allGames: Game[] = [...(currentWeekData.week.games || [])];

        const weekPromises = [];
        for (let i = Math.max(1, currentWeekNum - 3); i <= Math.min(18, currentWeekNum + 3); i++) {
          if (i !== currentWeekNum) {
            weekPromises.push(
              fetch(`/api/nfl/schedule/week?week=${i}&year=${currentWeekData.year}&type=${currentWeekData.type}`, { signal: abortController.signal })
                .then(res => res.ok ? res.json() : null)
                .then((data: WeekSchedule | null) => data?.week?.games || [])
                .catch((err) => {
                  if (err.name === 'AbortError') return [];
                  return [];
                })
            );
          }
        }

        const additionalWeeks = await Promise.all(weekPromises);
        additionalWeeks.forEach(games => allGames.push(...games));

        setAllWeeksData(allGames);
        setLoading(false);

        const completedGameIds = allGames
          .filter(g => g.status === "complete" || g.status === "closed")
          .map(g => g.id);

        const uncachedGameIds = completedGameIds.filter(id => !getGame(id));

        if (uncachedGameIds.length === 0) return;

        setLoadingScores(true);
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        let consecutiveErrors = 0;
        const maxConsecutiveErrors = 3;

        for (let i = 0; i < uncachedGameIds.length; i++) {
          if (abortController.signal.aborted) break;

          const gameId = uncachedGameIds[i];

          try {
            if (i > 0) await delay(500);

            const response = await fetch(`/api/nfl/games/${gameId}/boxscore`, { signal: abortController.signal });

            if (response.ok) {
              consecutiveErrors = 0;
              const boxscore: GameBoxScore = await response.json();
              const awayPoints = boxscore.summary?.away?.points ?? boxscore.away?.points;
              const homePoints = boxscore.summary?.home?.points ?? boxscore.home?.points;

              if (awayPoints !== undefined && homePoints !== undefined) {
                const originalGame = allGames.find(g => g.id === gameId);
                if (originalGame) {
                  setGame({
                    ...originalGame,
                    away: { ...originalGame.away, points: awayPoints },
                    home: { ...originalGame.home, points: homePoints }
                  });
                }
              }
            } else if (response.status === 429) {
              consecutiveErrors++;
              await delay(5000);
              i--;
              if (consecutiveErrors >= maxConsecutiveErrors) break;
            } else {
              consecutiveErrors++;
              if (consecutiveErrors >= maxConsecutiveErrors) break;
            }
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') break;
            consecutiveErrors++;
            if (consecutiveErrors >= maxConsecutiveErrors) break;
          }
        }

        if (!abortController.signal.aborted) {
          setLoadingScores(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    }

    fetchSchedule();

    return () => {
      abortController.abort();
    };
  }, [getGame, setGame, getCacheStats]);

  const allGames = allWeeksData.length > 0 ? allWeeksData : (schedule?.week?.games || []);
  const allGamesWithScores = getGamesWithScores(allGames);

  const upcomingGames = allGamesWithScores
    .filter((game) => game.status === "scheduled")
    .sort((a, b) => new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime());

  const completedGames = allGamesWithScores
    .filter((game) => game.status === "closed" || game.status === "complete")
    .sort((a, b) => new Date(b.scheduled).getTime() - new Date(a.scheduled).getTime());

  const inProgressGames = allGamesWithScores
    .filter((game) => game.status === "inprogress")
    .sort((a, b) => new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime());

  const allUpcoming = [...inProgressGames, ...upcomingGames];


  const hasMoreUpcoming = upcomingVisible < allUpcoming.length;
  const hasMoreCompleted = completedVisible < completedGames.length;

  const loadMoreUpcoming = useCallback(() => {
    setUpcomingVisible((prev) => {
      if (prev >= allUpcoming.length) return prev;
      return Math.min(prev + 10, allUpcoming.length);
    });
  }, [allUpcoming.length]);

  const loadMoreCompleted = useCallback(() => {
    setCompletedVisible((prev) => {
      if (prev >= completedGames.length) return prev;
      return Math.min(prev + 10, completedGames.length);
    });
  }, [completedGames.length]);

  useEffect(() => {
    const upcomingObserver = new IntersectionObserver(
      (entries) => {
        if (activeTab !== "upcoming") return;
        if (entries[0].isIntersecting) {
          loadMoreUpcoming();
        }
      },
      { threshold: 0.1 }
    );

    const completedObserver = new IntersectionObserver(
      (entries) => {
        if (activeTab !== "completed") return;
        if (entries[0].isIntersecting) {
          loadMoreCompleted();
        }
      },
      { threshold: 0.1 }
    );

    const upcomingRef = upcomingObserverRef.current;
    const completedRef = completedObserverRef.current;

    if (activeTab === "upcoming" && upcomingRef) {
      upcomingObserver.observe(upcomingRef);
    }

    if (activeTab === "completed" && completedRef) {
      completedObserver.observe(completedRef);
    }

    return () => {
      if (upcomingRef) {
        upcomingObserver.unobserve(upcomingRef);
      }
      if (completedRef) {
        completedObserver.unobserve(completedRef);
      }
    };
  }, [loadMoreUpcoming, loadMoreCompleted, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Loading games...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-red-400 text-lg mb-4">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">NFL Games</h1>
              {schedule && (
                <p className="text-gray-400">
                  {schedule.name} - Week {schedule.week.sequence}
                </p>
              )}
            </div>
            {loadingScores && (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading scores...</span>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-purple-600">
              Upcoming ({allUpcoming.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600">
              Completed ({completedGames.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {allUpcoming.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No upcoming games</p>
              </div>
            ) : (
              <>
                {allUpcoming.slice(0, upcomingVisible).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
                {hasMoreUpcoming && (
                  <div
                    ref={upcomingObserverRef}
                    className="flex justify-center py-8"
                  >
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedGames.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No completed games</p>
              </div>
            ) : (
              <>
                {completedGames.slice(0, completedVisible).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
                {hasMoreCompleted && (
                  <div
                    ref={completedObserverRef}
                    className="flex justify-center py-8"
                  >
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

