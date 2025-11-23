import { generateWorkoutPlan } from '@/lib/ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { goal, experience, days, equipment } = await request.json();
    
    // In a real app, you might validate input here
    const plan = await generateWorkoutPlan(goal, experience, days, equipment);
    
    return NextResponse.json(plan);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate workout plan' }, { status: 500 });
  }
}
