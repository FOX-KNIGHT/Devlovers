import { NextResponse } from 'next/server';
import { getUserById, getUserByUsername, createUser } from '@/db/queries/users.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');

    if (id) {
      const user = await getUserById(id);
      return NextResponse.json({ success: true, data: user });
    }

    if (username) {
      const user = await getUserByUsername(username);
      return NextResponse.json({ success: true, data: user });
    }

    return NextResponse.json(
      { success: false, error: 'Provide either id or username parameter' },
      { status: 400 }
    );
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
    const created = await createUser(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
