import type {
  WeekSchedule,
  SeasonSchedule,
  GameBoxScore,
  GameStatistics,
  SportradarErrorResponse,
} from '@/types/nfl';

const SPORTRADAR_BASE_URL = 'https://api.sportradar.com/nfl/official';

export class SportradarError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'SportradarError';
  }
}

function validateEnvVariables() {
  const apiKey = process.env.SPORTRADAR_API_KEY;
  const accessLevel = process.env.SPORTRADAR_ACCESS_LEVEL || 'trial';
  const language = process.env.SPORTRADAR_LANGUAGE || 'en';

  if (!apiKey) {
    throw new Error(
      'SPORTRADAR_API_KEY is not defined in environment variables'
    );
  }

  return { apiKey, accessLevel, language };
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText) as SportradarErrorResponse;
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        if (response.status === 429) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
            continue;
          }
          throw new SportradarError(
            'Rate limit exceeded. Please try again later.',
            429
          );
        }

        if (response.status === 401 || response.status === 403) {
          throw new SportradarError(
            'Invalid API key or access denied. Please check your credentials.',
            response.status
          );
        }

        throw new SportradarError(errorMessage, response.status);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error as Error;

      if (error instanceof SportradarError) {
        throw error;
      }

      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw new SportradarError(
    `Failed after ${retries} retries: ${lastError?.message || 'Unknown error'}`,
    500,
    lastError
  );
}

function buildUrl(
  endpoint: string,
  apiKey: string,
  accessLevel: string,
  language: string
): string {
  const url = `${SPORTRADAR_BASE_URL}/${accessLevel}/v7/${language}/${endpoint}.json?api_key=${apiKey}`;
  return url;
}

export async function getCurrentWeekSchedule(): Promise<WeekSchedule> {
  const { apiKey, accessLevel, language } = validateEnvVariables();
  const url = buildUrl(
    'games/current_week/schedule',
    apiKey,
    accessLevel,
    language
  );
  return fetchWithRetry<WeekSchedule>(url);
}

export async function getWeekSchedule(
  year: number,
  seasonType: 'REG' | 'PRE' | 'PST',
  week: number
): Promise<WeekSchedule> {
  const { apiKey, accessLevel, language } = validateEnvVariables();
  const url = buildUrl(
    `games/${year}/${seasonType}/${week}/schedule`,
    apiKey,
    accessLevel,
    language
  );
  return fetchWithRetry<WeekSchedule>(url);
}

export async function getCurrentSeasonSchedule(): Promise<SeasonSchedule> {
  const { apiKey, accessLevel, language } = validateEnvVariables();
  const url = buildUrl(
    'games/current_season/schedule',
    apiKey,
    accessLevel,
    language
  );
  return fetchWithRetry<SeasonSchedule>(url);
}

export async function getSeasonSchedule(
  year: number,
  seasonType: 'REG' | 'PRE' | 'PST'
): Promise<SeasonSchedule> {
  const { apiKey, accessLevel, language } = validateEnvVariables();
  const url = buildUrl(
    `games/${year}/${seasonType}/schedule`,
    apiKey,
    accessLevel,
    language
  );
  return fetchWithRetry<SeasonSchedule>(url);
}

export async function getGameBoxScore(gameId: string): Promise<GameBoxScore> {
  const { apiKey, accessLevel, language } = validateEnvVariables();
  const url = buildUrl(
    `games/${gameId}/boxscore`,
    apiKey,
    accessLevel,
    language
  );
  return fetchWithRetry<GameBoxScore>(url);
}

export async function getGameStatistics(
  gameId: string
): Promise<GameStatistics> {
  const { apiKey, accessLevel, language } = validateEnvVariables();
  const url = buildUrl(
    `games/${gameId}/statistics`,
    apiKey,
    accessLevel,
    language
  );
  return fetchWithRetry<GameStatistics>(url);
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 60 * 1000;

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}

