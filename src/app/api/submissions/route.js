import { NextResponse } from 'next/server';
import { getSubmissionsByHackathonSlug, createSubmission } from '@/db/queries/submissions.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hackathonSlug = searchParams.get('hackathonSlug');
    const items = await getSubmissionsByHackathonSlug(hackathonSlug);

    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
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
    const created = await createSubmission(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
