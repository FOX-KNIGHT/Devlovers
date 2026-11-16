'use client';

const DRAFT_STORAGE_KEY = 'devlovers_submission_drafts';

export function saveOfflineDraft(hackathonId, draftData) {
  if (typeof window === 'undefined') return;

  try {
    const existing = getOfflineDrafts();
    existing[hackathonId] = {
      ...draftData,
      syncPending: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error('Failed to save draft offline:', e);
    return false;
  }
}

export function getOfflineDraft(hackathonId) {
  if (typeof window === 'undefined') return null;

  try {
    const drafts = getOfflineDrafts();
    return drafts[hackathonId] || null;
  } catch (e) {
    return null;
  }
}

export function getOfflineDrafts() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function removeOfflineDraft(hackathonId) {
  if (typeof window === 'undefined') return;

  try {
    const existing = getOfflineDrafts();
    delete existing[hackathonId];
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to remove draft offline:', e);
  }
}

/**
 * Background Sync: Automatically synchronize pending drafts when connection is restored
 */
export async function syncOfflineDrafts(syncEndpoint = '/api/squads') {
  if (typeof window === 'undefined') return { synced: 0 };
  if (!navigator.onLine) return { synced: 0, offline: true };

  const drafts = getOfflineDrafts();
  const draftIds = Object.keys(drafts);
  let syncedCount = 0;

  for (const id of draftIds) {
    const draft = drafts[id];
    if (draft?.syncPending) {
      try {
        const res = await fetch(syncEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        });
        if (res.ok) {
          draft.syncPending = false;
          saveOfflineDraft(id, draft);
          syncedCount++;
        }
      } catch (err) {
        console.warn('Background sync deferred:', err.message);
      }
    }
  }

  return { synced: syncedCount };
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineDrafts();
  });
}
