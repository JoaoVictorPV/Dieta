import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  try {
    // Fetch programs
    const programsResult = await sql`
      SELECT * FROM programs 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;

    const programs = [];

    // Fetch exercises for each program
    // Ideally do a JOIN but for simplicity/speed in MVP loop:
    for (const prog of programsResult.rows) {
      const exResult = await sql`
        SELECT name, notes FROM exercises WHERE program_id = ${prog.id} ORDER BY created_at ASC
      `;
      programs.push({
        ...prog,
        exercises: exResult.rows
      });
    }

    return NextResponse.json(programs);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, exercises, userId } = await request.json();
    
    const result = await sql`
      INSERT INTO programs (user_id, name)
      VALUES (${userId}, ${name})
      RETURNING id;
    `;
    const programId = result.rows[0].id;

    for (const ex of exercises) {
      await sql`
        INSERT INTO exercises (program_id, name, notes)
        VALUES (${programId}, ${ex.name}, ${ex.notes || ''});
      `;
    }

    return NextResponse.json({ success: true, id: programId });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    await sql`DELETE FROM programs WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, exercises } = await request.json();
    
    // Update name
    await sql`UPDATE programs SET name = ${name} WHERE id = ${id}`;
    
    // Replace exercises (Simple approach: delete all, re-insert)
    await sql`DELETE FROM exercises WHERE program_id = ${id}`;
    
    for (const ex of exercises) {
      await sql`
        INSERT INTO exercises (program_id, name, notes)
        VALUES (${id}, ${ex.name}, ${ex.notes || ''});
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
