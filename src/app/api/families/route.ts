import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const families = await prisma.family.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(families);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name } = data;
  if (!name) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
  }
  const family = await prisma.family.create({ data: { name } });
  return NextResponse.json(family, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const familyId = searchParams.get('familyId');
  if (!familyId) {
    return NextResponse.json({ error: 'familyId é obrigatório' }, { status: 400 });
  }
  // Verifica se há membros na família
  const membersCount = await prisma.member.count({ where: { familyId: Number(familyId) } });
  if (membersCount > 0) {
    return NextResponse.json({ error: 'Não é possível remover a família enquanto houver membros cadastrados. Remova todos os membros primeiro.' }, { status: 400 });
  }
  await prisma.bill.deleteMany({ where: { familyId: Number(familyId) } });
  await prisma.family.delete({ where: { id: Number(familyId) } });
  return NextResponse.json({ success: true });
}
