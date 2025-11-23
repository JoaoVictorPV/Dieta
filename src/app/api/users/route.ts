import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Get all users (for profile selection screen)
    // In a real production app, you might want to limit this or use sessions, but for this personal app it's fine.
    const { rows } = await sql`SELECT id, name FROM users ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, pin } = await request.json();
    
    if (!name || !pin) {
      return NextResponse.json({ error: 'Name and PIN are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO users (name, pin)
      VALUES (${name}, ${pin})
      RETURNING id, name;
    `;
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
