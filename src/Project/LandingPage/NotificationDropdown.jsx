// src/Project/LandingPage/NotificationDropdown.jsx
import React from 'react';
import { useAppContext } from './AppContext.jsx'; // Sibling file

function NotificationDropdown({ isVisible }) {
  const { notifications, unreadCount, markAllNotificationsAsRead, markNotificationAsRead } = useAppContext();
  
  return (
    <div className={`notification-dropdown ${isVisible ? 'visible' : ''}`} id="notification-dropdown-menu">
      <h4>
        Notifications (<span id="unread-count">{unreadCount}</span> Unread)
        <div className="action-links">
          <a href="#" id="mark-all-read-btn" onClick={(e) => { e.preventDefault(); markAllNotificationsAsRead(); }}>Mark All as Read</a>
        </div>
      </h4>
      <div className="notification-list">
        {notifications.map(notification => (
          <a
            key={notification.id}
            href="#"
            className={`notification-item ${notification.unread ? 'unread' : 'read'}`}
            data-id={notification.id}
            onClick={(e) => { e.preventDefault(); markNotificationAsRead(notification.id); }}
          >
            <span className="icon-wrapper"><i className={notification.icon}></i></span>
            <div>
              <p>{notification.message}</p>
              <span>{notification.time}</span>
            </div>
          </a>
        ))}
      </div>
      <a href="#" style={{ display: 'block', textAlign: 'center', padding: '10px', color: 'var(--color-primary)', fontWeight: '600' }}>View All Notifications</a>
    </div>
  );
}

export default NotificationDropdown;