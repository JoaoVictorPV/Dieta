import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const query = searchParams.get('query') || '';

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  try {
    // Fetch global foods (user_id IS NULL) AND user specific foods
    const { rows } = await sql`
      SELECT * FROM foods 
      WHERE (user_id IS NULL OR user_id = ${userId})
      AND name ILIKE ${'%' + query + '%'}
      ORDER BY name ASC
      LIMIT 20
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, calories, carbs, fats, proteins, unit_g, userId } = await request.json();
    
    const result = await sql`
      INSERT INTO foods (user_id, name, calories, carbs, fats, proteins, unit_g)
      VALUES (${userId}, ${name}, ${calories}, ${carbs}, ${fats}, ${proteins}, ${unit_g || 100})
      RETURNING *;
    `;
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
