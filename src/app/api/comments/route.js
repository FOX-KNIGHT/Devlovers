import { NextResponse } from 'next/server';
import { getHackathonComments, addComment } from '@/db/queries/social.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hackathonId = searchParams.get('hackathonId');
    const comments = await getHackathonComments(hackathonId);

    return NextResponse.json({
      success: true,
      count: comments.length,
      data: comments,
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
    const comment = await addComment(body);
    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
