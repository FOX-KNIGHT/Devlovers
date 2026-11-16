'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useAppContext } from './AppContext.jsx';

function NotificationDropdown({ isVisible, onClose }) {
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useAppContext();

  if (!isVisible) return null;

  return (
    <div className="notification-dropdown active" id="notification-dropdown" role="region" aria-label="Notifications">
      <div className="dropdown-header">
        <h4>Notifications</h4>
        {notifications.some(n => n.unread) && (
          <button
            type="button"
            className="mark-all-read"
            onClick={markAllNotificationsAsRead}
            aria-label="Mark all notifications as read"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No new notifications</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${n.unread ? 'unread' : ''}`}
              onClick={() => markNotificationAsRead(n.id)}
            >
              <Bell className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="notification-content">
                <p>{n.message}</p>
                <span className="notification-time">{n.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default React.memo(NotificationDropdown);
