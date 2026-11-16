'use client';

/**
 * Updates the native application icon badge on supported platforms
 * (Windows Taskbar, macOS Dock, Android Chrome PWA).
 */
export async function updateAppBadge(count = 0) {
  if (typeof navigator === 'undefined') return;

  try {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    }
  } catch (err) {
    // Badging API not supported or permissions disabled
  }
}

export async function clearAppBadge() {
  if (typeof navigator === 'undefined') return;

  try {
    if ('clearAppBadge' in navigator) {
      await navigator.clearAppBadge();
    }
  } catch (err) {
    // Badging API not supported
  }
}
