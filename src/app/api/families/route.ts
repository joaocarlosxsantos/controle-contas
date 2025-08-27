import { NextRequest, NextResponse } from 'next/server';

// Camada de compatibilidade: mantém /api/families apontando para /api/groups
const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET() {
  return NextResponse.redirect(new URL('/api/groups', base));
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const r = await fetch(`${base}/api/groups`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, cache: 'no-store' });
  const data = await r.text();
  return new NextResponse(data, { status: r.status, headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const familyId = searchParams.get('familyId');
  if (!familyId) return NextResponse.json({ error: 'familyId é obrigatório' }, { status: 400 });
  return NextResponse.redirect(new URL(`/api/groups?groupId=${familyId}`, base));
}
