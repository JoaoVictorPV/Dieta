import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  try {
    const { rows } = await sql`SELECT * FROM nutrition_targets WHERE user_id = ${userId}`;
    if (rows.length > 0) return NextResponse.json(rows[0]);
    return NextResponse.json(null); // No targets yet
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, calories, carbs, fats, proteins } = await request.json();
    
    // Upsert
    await sql`
      INSERT INTO nutrition_targets (user_id, calories, carbs, fats, proteins)
      VALUES (${userId}, ${calories}, ${carbs}, ${fats}, ${proteins})
      ON CONFLICT (id) DO UPDATE 
      SET calories = ${calories}, carbs = ${carbs}, fats = ${fats}, proteins = ${proteins};
    `;
    // Note: On conflict ID assumes ID provided, but here we insert new or update user's. 
    // The schema uses ID PK, but we want unique per user maybe? Or just fetch by user_id and update if exists.
    // Let's do check and update.
    
    const existing = await sql`SELECT id FROM nutrition_targets WHERE user_id = ${userId}`;
    if (existing.rows.length > 0) {
       await sql`
        UPDATE nutrition_targets 
        SET calories = ${calories}, carbs = ${carbs}, fats = ${fats}, proteins = ${proteins}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    } else {
       await sql`
        INSERT INTO nutrition_targets (user_id, calories, carbs, fats, proteins)
        VALUES (${userId}, ${calories}, ${carbs}, ${fats}, ${proteins})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
