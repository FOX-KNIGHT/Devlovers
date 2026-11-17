import { db, schema, isLiveDatabase } from '../client.js';
import { SPONSOR_PRESETS } from '../../lib/workspace/sponsors-data.js';

export { SPONSOR_PRESETS };

/**
 * Get all available sponsor dispensary tracks
 */
export async function getSponsorPresets() {
  return SPONSOR_PRESETS;
}

/**
 * Dispense a verified sandboxed API credential for a sponsor track
 */
export async function dispenseSponsorToken({ sponsorId, userId = 'guest-hacker', hackathonSlug = 'future-of-ai-sprint-2026' }) {
  const preset = SPONSOR_PRESETS.find((p) => p.id === sponsorId) || SPONSOR_PRESETS[0];
  const randomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const token = `${preset.tokenPrefix}${randomSuffix}`;

  const dispensedRecord = {
    id: `disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sponsorId: preset.id,
    sponsorName: preset.sponsorName,
    category: preset.category,
    token,
    creditAmountCents: preset.creditAmountCents,
    userId,
    hackathonSlug,
    dispensedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days valid
    docsUrl: preset.docsUrl,
    perks: preset.perks,
  };

  if (isLiveDatabase()) {
    try {
      await db.insert(schema.sponsorCredits).values({
        sponsorName: preset.sponsorName,
        kind: preset.category,
        code: token,
        amountCents: preset.creditAmountCents,
        claimedAt: new Date(),
      });
    } catch (err) {
      console.warn('DB sponsor credit insert notice:', err.message);
    }
  }

  return dispensedRecord;
}
