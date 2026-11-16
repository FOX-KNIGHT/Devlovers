import { db, schema, isLiveDatabase } from '../client.js';
import { eq } from 'drizzle-orm';

/**
 * Record a judge's evaluation of a submission
 */
export async function submitEvaluation({ submissionId, judgeId, criteriaScores, rawScore, feedback }) {
  if (isLiveDatabase() && submissionId && judgeId) {
    try {
      const [inserted] = await db
        .insert(schema.evaluations)
        .values({
          submissionId,
          judgeId,
          criteriaScores,
          rawScore,
          feedback,
        })
        .returning();
      return inserted;
    } catch (err) {
      console.warn('DB submitEvaluation error:', err.message);
    }
  }

  return {
    id: `eval-${Date.now()}`,
    submissionId,
    judgeId,
    criteriaScores,
    rawScore,
    feedback,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate Z-Score normalization for a set of raw evaluation scores
 * Z = (X - μ) / σ
 */
export function calculateZScores(evaluations = []) {
  if (evaluations.length < 2) {
    return evaluations.map((e) => ({ ...e, zScore: 0 }));
  }

  const scores = evaluations.map((e) => e.rawScore);
  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance) || 1;

  return evaluations.map((e) => ({
    ...e,
    zScore: Number(((e.rawScore - mean) / standardDeviation).toFixed(3)),
  }));
}
