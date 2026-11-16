import { NextResponse } from 'next/server';
import { getHackathonBySlug } from '@/db/queries/hackathons.js';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const hackathon = await getHackathonBySlug(slug);

    if (!hackathon) {
      return NextResponse.json(
        { success: false, error: 'Hackathon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hackathon,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
