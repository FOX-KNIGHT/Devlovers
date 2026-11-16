import { NextResponse } from 'next/server';
import { toggleLike } from '@/db/queries/social.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await toggleLike(body);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
