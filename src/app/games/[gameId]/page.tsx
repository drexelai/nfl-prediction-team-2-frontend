'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameBoxScore, GameStatistics } from '@/types/nfl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTeamLogoUrl } from '@/lib/team-logos';
import { useGameStore } from '@/lib/game-store';
import Image from 'next/image';
import { ArrowLeft, Calendar, MapPin, Users, Clock, TrendingUp, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameDetailSkeleton } from '@/components/game-detail-skeleton';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [boxscore, setBoxscore] = useState<GameBoxScore | null>(null);
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setGame = useGameStore((state) => state.setGame);

  useEffect(() => {
    async function fetchGameData() {
      try {
        setLoading(true);
        const [boxscoreRes, statsRes] = await Promise.all([
          fetch(`/api/nfl/games/${gameId}/boxscore`),
          fetch(`/api/nfl/games/${gameId}/statistics`)
        ]);

        if (!boxscoreRes.ok) throw new Error('Failed to fetch game data');

        const boxscoreData: GameBoxScore = await boxscoreRes.json();
        setBoxscore(boxscoreData);

        const awayTeam = boxscoreData.summary?.away || boxscoreData.away;
        const homeTeam = boxscoreData.summary?.home || boxscoreData.home;
        const venue = boxscoreData.summary?.venue;
        const isCompleted = boxscoreData.status === 'closed' || boxscoreData.status === 'complete';
        if (awayTeam && homeTeam && boxscoreData.id && isCompleted && venue) {
          setGame({
            id: boxscoreData.id,
            status: boxscoreData.status as 'closed' | 'complete',
            scheduled: boxscoreData.scheduled,
            sr_id: boxscoreData.sr_id,
            game_type: boxscoreData.game_type as 'regular' | 'playoff' | 'preseason',
            conference_game: boxscoreData.conference_game,
            venue: venue,
            away: {
              id: awayTeam.id,
              name: awayTeam.name,
              alias: awayTeam.alias,
              points: awayTeam.points,
              game_number: 0,
              sr_id: ''
            },
            home: {
              id: homeTeam.id,
              name: homeTeam.name,
              alias: homeTeam.alias,
              points: homeTeam.points,
              game_number: 0,
              sr_id: ''
            }
          });
        }

        if (statsRes.ok) {
          const statsData: GameStatistics = await statsRes.json();
          setStatistics(statsData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    if (gameId) {
      fetchGameData();
    }
  }, [gameId, setGame]);

  if (loading) {
    return <GameDetailSkeleton />;
  }

  if (error || !boxscore) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-red-400 text-lg mb-4">Error: {error || 'Game not found'}</p>
              <Button onClick={() => router.push('/games')} variant="outline">
                <ArrowLeft className="mr-2 size-4" />
                Back to Games
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = boxscore.status === 'closed' || boxscore.status === 'complete';
  const isLive = boxscore.status === 'inprogress';

  const awayTeam = boxscore.summary?.away || boxscore.away;
  const homeTeam = boxscore.summary?.home || boxscore.home;
  const venue = boxscore.summary?.venue;
  const gameDate = new Date(boxscore.scheduled);

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 backdrop-blur-sm">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-red-400">LIVE</span>
          {boxscore.clock && boxscore.quarter && (
            <span className="text-sm text-red-300">Q{boxscore.quarter} - {boxscore.clock}</span>
          )}
        </div>
      );
    }
    if (isCompleted) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-sm">
          <span className="text-sm font-semibold text-emerald-400">FINAL</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/50 backdrop-blur-sm">
        <span className="text-sm font-semibold text-blue-400">SCHEDULED</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Button
          onClick={() => router.push('/games')}
          variant="ghost"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Games
        </Button>

        <div className="mb-8">
          {getStatusBadge()}
        </div>

        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl mb-8 overflow-hidden relative group">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 border border-cyan-500/0 group-hover:border-cyan-500/20 rounded-lg transition-colors duration-500" />

          <CardContent className="p-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-32 h-32 group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={getTeamLogoUrl(awayTeam?.alias || '')}
                    alt={awayTeam?.name || 'Away Team'}
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{awayTeam?.name}</h2>
                  <p className="text-gray-400 text-sm uppercase tracking-wider">{awayTeam?.alias}</p>
                </div>
                {(isCompleted || isLive) && (
                  <div className="text-6xl font-bold bg-linear-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {awayTeam?.points ?? 0}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-4xl font-bold text-gray-600">VS</div>
                {!isCompleted && !isLive && (
                  <div className="text-center space-y-2">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="size-4" />
                      <span className="text-sm">
                        {gameDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="size-4" />
                      <span className="text-sm">
                        {gameDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-32 h-32 group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={getTeamLogoUrl(homeTeam?.alias || '')}
                    alt={homeTeam?.name || 'Home Team'}
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{homeTeam?.name}</h2>
                  <p className="text-gray-400 text-sm uppercase tracking-wider">{homeTeam?.alias}</p>
                </div>
                {(isCompleted || isLive) && (
                  <div className="text-6xl font-bold bg-linear-to-br from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    {homeTeam?.points ?? 0}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {venue && (
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="size-5 text-cyan-400" />
                Venue Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Stadium</p>
                <p className="text-lg font-semibold text-white">{venue.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-lg font-semibold text-white">
                  {venue.city}, {venue.state}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Capacity</p>
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="size-4 text-purple-400" />
                  {venue.capacity.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {boxscore.weather && (
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="size-5 text-cyan-400" />
                Weather Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Condition</p>
                <p className="text-lg font-semibold text-white">{boxscore.weather.condition}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Temperature</p>
                <p className="text-lg font-semibold text-white">{boxscore.weather.temp}°F</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Wind</p>
                <p className="text-lg font-semibold text-white">
                  {boxscore.weather.wind.speed} mph {boxscore.weather.wind.direction}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {statistics && (isCompleted || isLive) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {statistics.away && (
              <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
                <CardHeader className="border-b border-slate-800/50">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="size-5 text-cyan-400" />
                    {statistics.away.name} Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {statistics.away.statistics?.passing && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Passing</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Yards</p>
                          <p className="text-2xl font-bold text-cyan-400">{statistics.away.statistics.passing.yards}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">TDs</p>
                          <p className="text-2xl font-bold text-emerald-400">{statistics.away.statistics.passing.touchdowns}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Completions</p>
                          <p className="text-lg font-semibold text-white">
                            {statistics.away.statistics.passing.completions}/{statistics.away.statistics.passing.attempts}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">INTs</p>
                          <p className="text-lg font-semibold text-red-400">{statistics.away.statistics.passing.interceptions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {statistics.away.statistics?.rushing && (
                    <div className="space-y-2 pt-4 border-t border-slate-800/50">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Rushing</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Yards</p>
                          <p className="text-2xl font-bold text-purple-400">{statistics.away.statistics.rushing.yards}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">TDs</p>
                          <p className="text-2xl font-bold text-emerald-400">{statistics.away.statistics.rushing.touchdowns}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Attempts</p>
                          <p className="text-lg font-semibold text-white">{statistics.away.statistics.rushing.attempts}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg</p>
                          <p className="text-lg font-semibold text-white">{statistics.away.statistics.rushing.avg_yards.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {statistics.away.statistics?.first_downs && (
                    <div className="space-y-2 pt-4 border-t border-slate-800/50">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Target className="size-4" />
                        First Downs
                      </p>
                      <p className="text-3xl font-bold text-white">{statistics.away.statistics.first_downs.total}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {statistics.home && (
              <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
                <CardHeader className="border-b border-slate-800/50">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="size-5 text-purple-400" />
                    {statistics.home.name} Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {statistics.home.statistics?.passing && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Passing</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Yards</p>
                          <p className="text-2xl font-bold text-cyan-400">{statistics.home.statistics.passing.yards}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">TDs</p>
                          <p className="text-2xl font-bold text-emerald-400">{statistics.home.statistics.passing.touchdowns}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Completions</p>
                          <p className="text-lg font-semibold text-white">
                            {statistics.home.statistics.passing.completions}/{statistics.home.statistics.passing.attempts}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">INTs</p>
                          <p className="text-lg font-semibold text-red-400">{statistics.home.statistics.passing.interceptions}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {statistics.home.statistics?.rushing && (
                    <div className="space-y-2 pt-4 border-t border-slate-800/50">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Rushing</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Yards</p>
                          <p className="text-2xl font-bold text-purple-400">{statistics.home.statistics.rushing.yards}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">TDs</p>
                          <p className="text-2xl font-bold text-emerald-400">{statistics.home.statistics.rushing.touchdowns}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Attempts</p>
                          <p className="text-lg font-semibold text-white">{statistics.home.statistics.rushing.attempts}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg</p>
                          <p className="text-lg font-semibold text-white">{statistics.home.statistics.rushing.avg_yards.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {statistics.home.statistics?.first_downs && (
                    <div className="space-y-2 pt-4 border-t border-slate-800/50">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Target className="size-4" />
                        First Downs
                      </p>
                      <p className="text-3xl font-bold text-white">{statistics.home.statistics.first_downs.total}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {boxscore.scoring && boxscore.scoring.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Scoring Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {boxscore.scoring.map((score, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[60px]">
                      <span className="text-xs text-gray-500">Q{score.quarter}</span>
                      <span className="text-sm font-mono text-cyan-400">{score.clock}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{score.team?.alias || 'Unknown'}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                          {score.type}
                        </span>
                      </div>
                      {score.description && (
                        <p className="text-sm text-gray-400">{score.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {score.away_points} - {score.home_points}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

