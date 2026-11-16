import { NextResponse } from 'next/server';
import { submitEvaluation, calculateZScores } from '@/db/queries/evaluations.js';

export async function POST(request) {
  try {
    const body = await request.json();
    if (body.action === 'calculate_z_scores') {
      const normalized = calculateZScores(body.scores || []);
      return NextResponse.json({ success: true, data: normalized });
    }

    const evaluation = await submitEvaluation(body);
    return NextResponse.json({ success: true, data: evaluation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
