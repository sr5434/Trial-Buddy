import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { trialData } = await request.json();

    // Mock GPT-5 question generation for now
    // In production, this would call the GPT-5 API with trial data context
    const questions = [
      {
        id: 1,
        text: 'What is your age and current health condition?'
      },
      {
        id: 2,
        text: 'Have you been diagnosed with the condition this trial is studying?'
      },
      {
        id: 3,
        text: 'What treatments have you tried so far for your condition?'
      },
      {
        id: 4,
        text: 'Are you currently taking any medications? If so, which ones?'
      },
      {
        id: 5,
        text: 'What are your primary concerns or questions about participating in this clinical trial?'
      }
    ];

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
