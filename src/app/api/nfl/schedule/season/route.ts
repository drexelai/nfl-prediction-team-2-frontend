import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentSeasonSchedule,
  getSeasonSchedule,
  SportradarError,
  getCachedData,
  setCachedData,
} from '@/lib/sportradar';
import type { SeasonSchedule } from '@/types/nfl';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');
    const seasonTypeParam = searchParams.get('type');

    const cacheKey = `season-schedule-${yearParam || 'current'}-${seasonTypeParam || 'current'}`;
    const cachedData = getCachedData<SeasonSchedule>(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    let data: SeasonSchedule;

    if (yearParam && seasonTypeParam) {
      const year = parseInt(yearParam, 10);
      const type = seasonTypeParam.toUpperCase() as 'REG' | 'PRE' | 'PST';

      if (isNaN(year)) {
        return NextResponse.json(
          {
            error: 'Invalid Parameters',
            message: 'Year must be a valid number',
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      if (!['REG', 'PRE', 'PST'].includes(type)) {
        return NextResponse.json(
          {
            error: 'Invalid Parameters',
            message: 'Type must be one of: REG, PRE, PST',
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      data = await getSeasonSchedule(year, type);
    } else {
      data = await getCurrentSeasonSchedule();
    }

    setCachedData(cacheKey, data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

    console.error('Error fetching season schedule:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching the season schedule',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

