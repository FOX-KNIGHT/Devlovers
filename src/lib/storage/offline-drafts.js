'use client';

const DRAFT_STORAGE_KEY = 'devlovers_submission_drafts';

export function saveOfflineDraft(hackathonId, draftData) {
  if (typeof window === 'undefined') return;

  try {
    const existing = getOfflineDrafts();
    existing[hackathonId] = {
      ...draftData,
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
