import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { id, pin } = await request.json();
    
    // Verify user credentials
    const { rows } = await sql`
      SELECT id, name FROM users 
      WHERE id = ${id} AND pin = ${pin}
    `;
    
    if (rows.length > 0) {
      return NextResponse.json({ success: true, user: rows[0] });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
