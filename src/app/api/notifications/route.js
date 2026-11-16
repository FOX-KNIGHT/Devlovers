import { NextResponse } from 'next/server';
import {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/db/queries/notifications.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const items = await getNotifications(userId);

    return NextResponse.json({
      success: true,
      count: items.length,
      unreadCount: items.filter((n) => n.unread).length,
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
    const created = await createNotification(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (body.all) {
      await markAllNotificationsRead(body.userId);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }
    if (body.id) {
      await markNotificationRead(body.id);
      return NextResponse.json({ success: true, message: `Notification ${body.id} marked as read` });
    }
    return NextResponse.json(
      { success: false, error: 'Provide either id or all: true' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
