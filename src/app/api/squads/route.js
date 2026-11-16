import { NextResponse } from 'next/server';
import { getSquadsByHackathonSlug, createSquad } from '@/db/queries/squads.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hackathonSlug = searchParams.get('hackathonSlug');
    const squads = await getSquadsByHackathonSlug(hackathonSlug);

    return NextResponse.json({
      success: true,
      count: squads.length,
      data: squads,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const created = await createSquad(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
