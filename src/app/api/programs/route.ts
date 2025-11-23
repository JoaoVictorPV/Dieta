import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM programs ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, exercises } = await request.json();
    
    const result = await sql`
      INSERT INTO programs (name)
      VALUES (${name})
      RETURNING id;
    `;
    const programId = result.rows[0].id;

    // Note: In a real app, use a transaction or batch insert
    for (const ex of exercises) {
      await sql`
        INSERT INTO exercises (workout_id, name, notes)
        VALUES (${programId}, ${ex.name}, ${ex.notes || ''});
      `;
    }

    return NextResponse.json({ success: true, id: programId });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
