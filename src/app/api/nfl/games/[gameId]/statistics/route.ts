import { NextRequest, NextResponse } from 'next/server';
import {
  getGameStatistics,
  SportradarError,
  getCachedData,
  setCachedData,
} from '@/lib/sportradar';
import type { GameStatistics } from '@/types/nfl';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json(
        {
          error: 'Invalid Parameters',
          message: 'Game ID is required',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    const cacheKey = `statistics-${gameId}`;
    const cachedData = getCachedData<GameStatistics>(cacheKey);

    if (cachedData) {
      const cacheControl =
        cachedData.status === 'closed' || cachedData.status === 'complete'
          ? 'public, s-maxage=3600, stale-while-revalidate=7200'
          : 'public, s-maxage=30, stale-while-revalidate=60';

      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': cacheControl,
        },
      });
    }

    const data = await getGameStatistics(gameId);

    setCachedData(cacheKey, data);

    const cacheControl =
      data.status === 'closed' || data.status === 'complete'
        ? 'public, s-maxage=3600, stale-while-revalidate=7200'
        : 'public, s-maxage=30, stale-while-revalidate=60';

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': cacheControl,
      },
    });
  } catch (error) {
    if (error instanceof SportradarError) {
      return NextResponse.json(
        {
          error: 'Sportradar API Error',
          message: error.message,
          statusCode: error.statusCode,
        },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching game statistics:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching the game statistics',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

