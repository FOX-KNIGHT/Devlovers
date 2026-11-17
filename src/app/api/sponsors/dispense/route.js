import { NextResponse } from 'next/server.js';
import { getSponsorPresets, dispenseSponsorToken } from '../../../../db/queries/sponsors.js';

export async function GET() {
  const presets = await getSponsorPresets();
  return NextResponse.json({
    success: true,
    data: presets,
    meta: {
      totalSponsors: presets.length,
      dispensaryStatus: 'ONLINE',
      mode: 'SANDBOX',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { sponsorId, userId, hackathonSlug } = body;

    if (!sponsorId) {
      return NextResponse.json(
        { success: false, error: 'sponsorId is required' },
        { status: 400 }
      );
    }

    const dispensed = await dispenseSponsorToken({
      sponsorId,
      userId: userId || 'guest-hacker',
      hackathonSlug: hackathonSlug || 'future-of-ai-sprint-2026',
    });

    return NextResponse.json({
      success: true,
      data: dispensed,
      message: `Successfully dispensed sandboxed API token for ${dispensed.sponsorName}`,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
