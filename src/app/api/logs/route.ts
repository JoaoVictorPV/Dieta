import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  try {
    const { rows } = await sql`
      SELECT * FROM workout_logs 
      WHERE user_id = ${userId} 
      ORDER BY date DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, programId, programName, exercisesCompleted, totalExercises, caloriesBurned, date } = await request.json();
    
    await sql`
      INSERT INTO workout_logs (user_id, program_id, program_name, exercises_completed, total_exercises, calories_burned, date)
      VALUES (${userId}, ${programId}, ${programName}, ${exercisesCompleted}, ${totalExercises}, ${caloriesBurned}, ${date})
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
