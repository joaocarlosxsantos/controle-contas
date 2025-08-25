import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/members?familyId=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const familyId = searchParams.get('familyId');
  if (!familyId) {
    return NextResponse.json({ error: 'familyId é obrigatório' }, { status: 400 });
  }
  const members = await prisma.member.findMany({
    where: { familyId: Number(familyId) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(members);
}

// POST /api/members
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { familyId, name, phone } = data;
  if (!familyId || !name || !phone) {
    return NextResponse.json({ error: 'Campos obrigatórios: familyId, name, phone' }, { status: 400 });
  }
  const member = await prisma.member.create({
    data: { familyId: Number(familyId), name, phone },
  });
  return NextResponse.json(member, { status: 201 });
}

// DELETE /api/members?memberId=1
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  if (!memberId) {
    return NextResponse.json({ error: 'memberId é obrigatório' }, { status: 400 });
  }
  await prisma.member.delete({ where: { id: Number(memberId) } });
  return NextResponse.json({ success: true });
}
