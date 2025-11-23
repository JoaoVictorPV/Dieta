import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const date = searchParams.get('date');

  if (!userId || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  try {
    const { rows } = await sql`
      SELECT nl.id, nl.amount_g as amount, f.name, f.calories, f.carbs, f.fats, f.proteins, f.unit_g
      FROM nutrition_logs nl
      JOIN foods f ON nl.food_id = f.id
      WHERE nl.user_id = ${userId} AND nl.log_date = ${date}
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, foodId, date, amount } = await request.json();
    
    await sql`
      INSERT INTO nutrition_logs (user_id, food_id, log_date, amount_g)
      VALUES (${userId}, ${foodId}, ${date}, ${amount})
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  try {
    await sql`DELETE FROM nutrition_logs WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
