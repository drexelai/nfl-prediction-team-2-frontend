'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ChevronRight, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Game, SeasonSchedule } from '@/types/nfl';
import { getTeamLogoUrl } from '@/lib/team-logos';
import { getCachedGames } from '@/lib/game-cache';

interface GameSearchResult {
  game: Game;
  matchType: 'home' | 'away' | 'both';
}

interface QuickFilter {
  label: string;
  icon: React.ReactNode;
  filter: (games: Game[]) => Game[];
}

const SVGFilter = () => {
  return (
    <svg width="0" height="0">
      <filter id="blob">
        <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
        <feColorMatrix
          values="
      1 0 0 0 0
      0 1 0 0 0
      0 0 1 0 0
      0 0 0 18 -9
    "
          result="blob"
        />
        <feBlend in="SourceGraphic" in2="blob" />
      </filter>
    </svg>
  );
};

interface QuickFilterButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickFilterButton = ({ icon, onClick }: QuickFilterButtonProps) => {
  return (
    <div
      onClick={onClick}
      className="rounded-full cursor-pointer hover:shadow-lg opacity-30 hover:opacity-100 transition-[opacity,shadow] duration-200"
    >
      <div className="size-16 aspect-square flex items-center justify-center">{icon}</div>
    </div>
  );
};

interface SpotlightPlaceholderProps {
  text: string;
  className?: string;
}

const SpotlightPlaceholder = ({ text, className }: SpotlightPlaceholderProps) => {
  return (
    <motion.div
      layout
      className={cn('absolute text-gray-500 flex items-center pointer-events-none z-10', className)}
    >
      <AnimatePresence mode="popLayout">
        <motion.p
          layoutId={`placeholder-${text}`}
          key={`placeholder-${text}`}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

interface SpotlightInputProps {
  placeholder: string;
  hidePlaceholder: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholderClassName?: string;
}

const SpotlightInput = ({
  placeholder,
  hidePlaceholder,
  value,
  onChange,
  placeholderClassName
}: SpotlightInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex items-center w-full justify-start gap-2 px-6 h-16">
      <motion.div layoutId="search-icon">
        <Search />
      </motion.div>
      <div className="flex-1 relative text-2xl">
        {!hidePlaceholder && (
          <SpotlightPlaceholder text={placeholder} className={placeholderClassName} />
        )}

        <motion.input
          ref={inputRef}
          layout="position"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none ring-none selection:bg-black/10"
        />
      </div>
    </div>
  );
};

interface GameSearchCardProps {
  game: Game;
  isLast: boolean;
}

const GameSearchCard = ({ game, isLast }: GameSearchCardProps) => {
  const isCompleted = game.status === 'closed' || game.status === 'complete';
  const isLive = game.status === 'inprogress';

  const getStatusInfo = () => {
    if (isLive) {
      const clockInfo = game.clock && game.quarter ? `Q${game.quarter} - ${game.clock}` : 'LIVE';
      return {
        text: clockInfo,
        className: 'text-red-500 font-semibold flex items-center gap-1',
        icon: <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      };
    }
    if (isCompleted) {
      const score = `${game.away.points ?? 0} - ${game.home.points ?? 0}`;
      return {
        text: `Final: ${score}`,
        className: 'text-green-600 font-medium',
        icon: null
      };
    }
    const gameDate = new Date(game.scheduled);
    const formattedDate = gameDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = gameDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    return {
      text: `${formattedDate} at ${formattedTime}`,
      className: 'text-muted-foreground font-medium',
      icon: null
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <a
      href={`/games/${game.id}`}
      className="overflow-hidden w-full group/card focus:outline-[none]"
    >
      <div
        className={cn(
          'flex items-center text-black justify-between hover:bg-white gap-3 py-2 px-3 rounded-xl hover:shadow-md w-full transition-all',
          isLast && 'rounded-b-3xl'
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative size-10 flex items-center justify-center">
              <Image
                src={getTeamLogoUrl(game.away.alias)}
                alt={game.away.name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-gray-600">@</span>
            <div className="relative size-10 flex items-center justify-center">
              <Image
                src={getTeamLogoUrl(game.home.alias)}
                alt={game.home.name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-normal truncate">
              {game.away.name} @ {game.home.name}
            </p>
            <p className={cn('text-xs flex items-center gap-1', statusInfo.className)}>
              {statusInfo.icon}
              {statusInfo.text}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 shrink-0">
          <ChevronRight className="size-5" />
        </div>
      </div>
    </a>
  );
};

interface SearchResultsContainerProps {
  searchResults: GameSearchResult[];
  onHover: (index: number | null) => void;
}

const SearchResultsContainer = ({ searchResults, onHover }: SearchResultsContainerProps) => {
  return (
    <motion.div
      layout
      onMouseLeave={() => onHover(null)}
      className="px-2 border-t flex flex-col bg-neutral-100 max-h-[60vh] md:max-h-96 overflow-y-auto w-full py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
    >
      {searchResults.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No games found</p>
          <p className="text-xs mt-2 text-gray-400">Try searching for a team name like &quot;Vikings&quot; or &quot;Chiefs&quot;</p>
        </div>
      ) : (
        searchResults.map((result, index) => {
          return (
            <motion.div
              key={`search-result-${result.game.id}`}
              onMouseEnter={() => onHover(index)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.2,
                ease: 'easeOut'
              }}
            >
              <GameSearchCard
                game={result.game}
                isLast={index === searchResults.length - 1}
              />
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
};

interface NFLGameSearchProps {
  isOpen?: boolean;
  handleClose?: () => void;
}

export const NFLGameSearch = ({ isOpen = true, handleClose = () => {} }: NFLGameSearchProps) => {
  const [hovered, setHovered] = useState(false);
  const [hoveredSearchResult, setHoveredSearchResult] = useState<number | null>(null);
  const [hoveredFilter, setHoveredFilter] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch('/api/nfl/schedule/season');
        if (!response.ok) throw new Error('Failed to fetch games');
        const data: SeasonSchedule = await response.json();
        const games = data.weeks.flatMap((week) => week.games || []);

        const cachedScores = getCachedGames();
        const gamesWithScores = games.map(game => {
          const cachedGame = cachedScores.get(game.id);
          return cachedGame || game;
        });

        setAllGames(gamesWithScores);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching games:', error);
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchGames();
    }
  }, [isOpen]);

  const handleSearchValueChange = (value: string) => {
    setSearchValue(value);
  };

  const quickFilters: QuickFilter[] = [
    {
      label: 'This Week',
      icon: <Calendar />,
      filter: (games) => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        return games.filter((game) => {
          const gameDate = new Date(game.scheduled);
          return gameDate >= weekStart && gameDate < weekEnd;
        });
      }
    },
    {
      label: 'Live',
      icon: <TrendingUp />,
      filter: (games) => games.filter((game) => game.status === 'inprogress')
    },
    {
      label: 'Upcoming',
      icon: <Clock />,
      filter: (games) =>
        games
          .filter((game) => game.status === 'scheduled')
          .sort((a, b) => new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime())
          .slice(0, 10)
    },
    {
      label: 'Completed',
      icon: <CheckCircle />,
      filter: (games) =>
        games
          .filter((game) => game.status === 'closed' || game.status === 'complete')
          .sort((a, b) => new Date(b.scheduled).getTime() - new Date(a.scheduled).getTime())
          .slice(0, 10)
    }
  ];

  const handleQuickFilter = (filter: QuickFilter) => {
    setSearchValue('');
    const filtered = filter.filter(allGames);
    setAllGames([...filtered, ...allGames]);
  };

  const searchResults: GameSearchResult[] = React.useMemo(() => {
    if (!searchValue.trim()) return [];

    const searchLower = searchValue.toLowerCase();
    const results: GameSearchResult[] = [];

    allGames.forEach((game) => {
      const awayName = game.away.name.toLowerCase();
      const awayAlias = game.away.alias.toLowerCase();
      const homeName = game.home.name.toLowerCase();
      const homeAlias = game.home.alias.toLowerCase();

      const awayMatches = awayName.includes(searchLower) || awayAlias.includes(searchLower);
      const homeMatches = homeName.includes(searchLower) || homeAlias.includes(searchLower);

      if (awayMatches && homeMatches) {
        results.push({ game, matchType: 'both' });
      } else if (awayMatches) {
        results.push({ game, matchType: 'away' });
      } else if (homeMatches) {
        results.push({ game, matchType: 'home' });
      }
    });

    results.sort((a, b) => {
      if (a.game.status === 'inprogress' && b.game.status !== 'inprogress') return -1;
      if (a.game.status !== 'inprogress' && b.game.status === 'inprogress') return 1;

      const aDate = new Date(a.game.scheduled);
      const bDate = new Date(b.game.scheduled);
      const now = new Date();

      const aIsUpcoming = aDate > now;
      const bIsUpcoming = bDate > now;

      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      if (aIsUpcoming) {
        return aDate.getTime() - bDate.getTime();
      } else {
        return bDate.getTime() - aDate.getTime();
      }
    });

    return results.slice(0, 15);
  }, [searchValue, allGames]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md"
            onClick={handleClose}
          />
          <motion.div
            initial={{
              opacity: 0,
              filter: 'blur(20px) url(#blob)',
              scaleX: 1.3,
              scaleY: 1.1,
              y: -10
            }}
            animate={{
              opacity: 1,
              filter: 'blur(0px) url(#blob)',
              scaleX: 1,
              scaleY: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              filter: 'blur(20px) url(#blob)',
              scaleX: 1.3,
              scaleY: 1.1,
              y: 10
            }}
            transition={{
              stiffness: 550,
              damping: 50,
              type: 'spring'
            }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 pointer-events-none"
          >
            <SVGFilter />

          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
              setHovered(false);
              setHoveredFilter(null);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ filter: 'url(#blob)' }}
            className={cn(
              'w-full flex items-center justify-end gap-2 md:gap-4 z-20 group pointer-events-auto',
              '[&>div]:bg-neutral-100 [&>div]:text-black [&>div]:rounded-full [&>div]:backdrop-blur-xl',
              '[&_svg]:size-6 md:[&_svg]:size-7 [&_svg]:stroke-[1.4]',
              'max-w-3xl'
            )}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                layoutId="search-input-container"
                transition={{
                  layout: {
                    duration: 0.5,
                    type: 'spring',
                    bounce: 0.2
                  }
                }}
                style={{
                  borderRadius: '30px'
                }}
                className="h-full w-full flex flex-col items-center justify-start z-10 relative shadow-lg overflow-hidden border ring-1 ring-foreground"
              >
                <SpotlightInput
                  placeholder={
                    hoveredFilter !== null
                      ? quickFilters[hoveredFilter].label
                      : hoveredSearchResult !== null && searchResults[hoveredSearchResult]
                      ? `${searchResults[hoveredSearchResult].game.away.alias} @ ${searchResults[hoveredSearchResult].game.home.alias}`
                      : loading
                      ? 'Loading games...'
                      : 'Search NFL teams...'
                  }
                  placeholderClassName={
                    hoveredSearchResult !== null ? 'text-black bg-white' : 'text-gray-500'
                  }
                  hidePlaceholder={!(hoveredSearchResult !== null || !searchValue)}
                  value={searchValue}
                  onChange={handleSearchValueChange}
                />

                {searchValue && (
                  <SearchResultsContainer
                    searchResults={searchResults}
                    onHover={setHoveredSearchResult}
                  />
                )}
              </motion.div>
              {hovered &&
                !searchValue &&
                quickFilters.map((filter, index) => (
                  <motion.div
                    key={`filter-${index}`}
                    onMouseEnter={() => setHoveredFilter(index)}
                    onClick={() => {
                      setSearchValue('');
                      setTimeout(() => handleClose(), 300);
                    }}
                    layout
                    initial={{ scale: 0.7, x: -1 * (64 * (index + 1)) }}
                    animate={{ scale: 1, x: 0 }}
                    exit={{
                      scale: 0.7,
                      x:
                        1 *
                        (16 * (quickFilters.length - index - 1) +
                          64 * (quickFilters.length - index - 1))
                    }}
                    transition={{
                      duration: 0.8,
                      type: 'spring',
                      bounce: 0.2,
                      delay: index * 0.05
                    }}
                    className="rounded-full cursor-pointer"
                  >
                    <QuickFilterButton icon={filter.icon} onClick={() => handleQuickFilter(filter)} />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

