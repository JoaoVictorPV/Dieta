import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  try {
    const { rows } = await sql`
      SELECT * FROM body_measurements 
      WHERE user_id = ${userId} 
      ORDER BY date ASC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, date, weight, bodyFat, muscleMass, water, visceralFat, bmr, metabolicAge } = await request.json();
    
    await sql`
      INSERT INTO body_measurements (user_id, date, weight, body_fat_percent, muscle_mass_percent, water_percent, visceral_fat_level, basal_metabolic_rate, metabolic_age)
      VALUES (${userId}, ${date}, ${weight}, ${bodyFat}, ${muscleMass}, ${water}, ${visceralFat}, ${bmr}, ${metabolicAge})
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
