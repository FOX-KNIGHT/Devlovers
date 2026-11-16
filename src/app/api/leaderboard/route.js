import { NextResponse } from 'next/server';
import { getGlobalLeaderboard } from '@/db/queries/leaderboard.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const leaderboard = await getGlobalLeaderboard({ limit });

    return NextResponse.json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
