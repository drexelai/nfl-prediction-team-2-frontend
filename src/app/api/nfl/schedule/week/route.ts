import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentWeekSchedule,
  getWeekSchedule,
  SportradarError,
  getCachedData,
  setCachedData,
} from '@/lib/sportradar';
import type { WeekSchedule } from '@/types/nfl';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const weekParam = searchParams.get('week');
    const yearParam = searchParams.get('year');
    const seasonTypeParam = searchParams.get('type');

    const cacheKey = `week-schedule-${yearParam || 'current'}-${seasonTypeParam || 'current'}-${weekParam || 'current'}`;
    const cachedData = getCachedData<WeekSchedule>(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    let data: WeekSchedule;

    if (weekParam && yearParam && seasonTypeParam) {
      const week = parseInt(weekParam, 10);
      const year = parseInt(yearParam, 10);
      const type = seasonTypeParam.toUpperCase() as 'REG' | 'PRE' | 'PST';

      if (isNaN(week) || isNaN(year)) {
        return NextResponse.json(
          {
            error: 'Invalid Parameters',
            message: 'Week and year must be valid numbers',
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

      data = await getWeekSchedule(year, type, week);
    } else {
      data = await getCurrentWeekSchedule();
    }

    setCachedData(cacheKey, data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
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

    console.error('Error fetching week schedule:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while fetching the week schedule',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

