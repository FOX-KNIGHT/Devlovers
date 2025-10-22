import React, { useCallback } from 'react';
import { useAppContext } from './AppContext.jsx';

function NotificationDropdown({ isVisible }) {
  const { 
    notifications, 
    unreadCount, 
    markAllNotificationsAsRead, 
    markNotificationAsRead 
  } = useAppContext();
  
  const handleMarkAllRead = useCallback((e) => {
    e.preventDefault();
    markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead]);

  const handleNotificationClick = useCallback((e, notificationId) => {
    e.preventDefault();
    markNotificationAsRead(notificationId);
    // Add navigation to notification detail if needed
  }, [markNotificationAsRead]);

  const handleViewAll = useCallback((e) => {
    e.preventDefault();
    console.log('View all notifications');
    // Add navigation to notifications page
  }, []);

  return (
    <div 
      className={`notification-dropdown ${isVisible ? 'visible' : ''}`} 
      id="notification-dropdown-menu"
      role="menu"
      aria-label="Notifications"
    >
      <h4>
        <span>
          Notifications 
          <span style={{ 
            marginLeft: '5px',
            color: unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}>
            ({unreadCount} Unread)
          </span>
        </span>
        <div className="action-links">
          <a 
            href="#" 
            id="mark-all-read-btn" 
            onClick={handleMarkAllRead}
            aria-label="Mark all as read"
          >
            Mark All as Read
          </a>
        </div>
      </h4>
      
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <a
              key={notification.id}
              href="#"
              className={`notification-item ${notification.unread ? 'unread' : 'read'}`}
              data-id={notification.id}
              onClick={(e) => handleNotificationClick(e, notification.id)}
              role="menuitem"
              aria-label={`${notification.message} - ${notification.time}${notification.unread ? ' (unread)' : ''}`}
            >
              <span className="icon-wrapper">
                <i className={notification.icon} aria-hidden="true"></i>
              </span>
              <div>
                <p>{notification.message}</p>
                <span>
                  <i className="fas fa-clock" aria-hidden="true"></i> {notification.time}
                </span>
              </div>
            </a>
          ))
        ) : (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <i className="fas fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
            <p>No notifications</p>
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <a 
          href="#" 
          onClick={handleViewAll}
          style={{ 
            display: 'block', 
            textAlign: 'center', 
            padding: '12px', 
            color: 'var(--color-primary)', 
            fontWeight: '600',
            borderTop: '1px solid var(--color-border)'
          }}
          role="menuitem"
        >
          <i className="fas fa-arrow-right" aria-hidden="true"></i> View All Notifications
        </a>
      )}
    </div>
  );
}

export default React.memo(NotificationDropdown);