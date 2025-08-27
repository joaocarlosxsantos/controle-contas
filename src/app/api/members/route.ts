import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/members?groupId=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'groupId é obrigatório' }, { status: 400 });
  }
  const members = await prisma.member.findMany({
    where: { groupId: Number(groupId) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(members);
}

// POST /api/members
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { groupId, name, phone } = data;
  if (!groupId || !name || !phone) {
    return NextResponse.json({ error: 'Campos obrigatórios: groupId, name, phone' }, { status: 400 });
  }
  const member = await prisma.member.create({
    data: { groupId: Number(groupId), name, phone },
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
