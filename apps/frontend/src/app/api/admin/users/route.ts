import { NextResponse } from 'next/server';

// In-memory store
let users = [
  { id: '1', name: 'Carlos Mendoza', role: 'Paciente', status: 'Activo' },
  { id: '2', name: 'Dra. Elena Rivas', role: 'Doctor', status: 'Activo' },
  { id: '3', name: 'Ana Torres', role: 'Paciente', status: 'Inactivo' },
];

export async function GET() {
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      role: data.role,
      status: data.status || 'Activo',
    };
    users.push(newUser);
    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const index = users.findIndex((u) => u.id === data.id);
    if (index === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    users[index] = { ...users[index], ...data };
    return NextResponse.json({ success: true, user: users[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    users = users.filter((u) => u.id !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 400 });
  }
}
