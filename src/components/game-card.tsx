import { Card, CardContent } from "@/components/ui/card";
import { getTeamLogoUrl } from "@/lib/team-logos";
import { Game } from "@/types/nfl";
import Image from "next/image";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const isCompleted = game.status === "closed" || game.status === "complete";
  const isLive = game.status === "inprogress";

  const awayPoints = game.away.points;
  const homePoints = game.home.points;
  const hasScores = awayPoints !== undefined && homePoints !== undefined;

  const gameDate = new Date(game.scheduled);
  const formattedDate = gameDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const formattedTime = gameDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/50 backdrop-blur-sm">
          <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
      );
    }
    if (isCompleted) {
      return (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/50 backdrop-blur-sm">
          <span className="text-xs font-semibold text-green-400">FINAL</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="relative overflow-hidden bg-white/5 dark:bg-white/5 backdrop-blur-lg border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />

      {getStatusBadge()}

      <CardContent className="relative p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
              <Image
                src={getTeamLogoUrl(game.away.alias)}
                alt={game.away.name}
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-lg text-white truncate">
                {game.away.name}
              </div>
              <div className="text-sm text-gray-400">{game.away.alias}</div>
            </div>
            {(isCompleted || isLive) && hasScores && (
              <div className="text-3xl font-bold text-white">
                {awayPoints}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center px-4 min-w-[80px]">
            {!isCompleted ? (
              <>
                <div className="text-sm text-gray-400 font-medium">
                  {formattedDate}
                </div>
                <div className="text-xs text-gray-500 mt-1">{formattedTime}</div>
              </>
            ) : (
              <div className="text-sm text-gray-400 font-medium">VS</div>
            )}
          </div>

          <div className="flex-1 flex items-center gap-4 flex-row-reverse">
            <div className="relative w-16 h-16 shrink-0">
              <Image
                src={getTeamLogoUrl(game.home.alias)}
                alt={game.home.name}
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="font-semibold text-lg text-white truncate">
                {game.home.name}
              </div>
              <div className="text-sm text-gray-400">{game.home.alias}</div>
            </div>
            {(isCompleted || isLive) && hasScores && (
              <div className="text-3xl font-bold text-white">
                {homePoints}
              </div>
            )}
          </div>
        </div>

        {isCompleted && !hasScores && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Score not available yet
            </p>
          </div>
        )}

        {game.venue && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>
                {game.venue.name}, {game.venue.city}
              </span>
            </div>
            {isLive && game.clock && game.quarter && (
              <div className="text-yellow-400 font-medium">
                Q{game.quarter} - {game.clock}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

