import { NextResponse } from 'next/server';
import { getConversationMessages, sendMessage, createConversation } from '@/db/queries/messages.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId') || 'conv-1';
    const items = await getConversationMessages(conversationId);

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
    if (body.action === 'create_conversation') {
      const conv = await createConversation({ memberIds: body.memberIds });
      return NextResponse.json({ success: true, data: conv }, { status: 201 });
    }

    const message = await sendMessage(body);
    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
