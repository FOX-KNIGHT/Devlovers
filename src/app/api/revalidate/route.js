import { NextResponse } from 'next/server.js';
import { revalidatePath, revalidateTag } from 'next/cache.js';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || 'devlovers_secret_token_2026';

export async function POST(request) {
  try {
    const url = new URL(request.url);
    const querySecret = url.searchParams.get('secret');

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty if parameters are in query string
    }

    const secret = querySecret || body.secret;

    if (!secret || secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid revalidation secret' },
        { status: 401 }
      );
    }

    const path = url.searchParams.get('path') || body.path;
    const tag = url.searchParams.get('tag') || body.tag;

    if (!path && !tag) {
      return NextResponse.json(
        { success: false, error: 'Either path or tag parameter is required for revalidation' },
        { status: 400 }
      );
    }

    if (path) {
      try {
        revalidatePath(path);
      } catch (err) {
        console.warn('revalidatePath warning in dev/test:', err.message);
      }
    }

    if (tag) {
      try {
        revalidateTag(tag);
      } catch (err) {
        console.warn('revalidateTag warning in dev/test:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      path: path || null,
      tag: tag || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during revalidation' },
      { status: 500 }
    );
  }
}
