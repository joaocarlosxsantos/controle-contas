import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const groups = await prisma.group.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name } = data;
  if (!name) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
  }
  const group = await prisma.group.create({ data: { name } });
  return NextResponse.json(group, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'groupId é obrigatório' }, { status: 400 });
  }
  const membersCount = await prisma.member.count({ where: { groupId: Number(groupId) } });
  if (membersCount > 0) {
    return NextResponse.json({ error: 'Não é possível remover o grupo enquanto houver membros cadastrados. Remova todos os membros primeiro.' }, { status: 400 });
  }
  await prisma.bill.deleteMany({ where: { groupId: Number(groupId) } });
  await prisma.group.delete({ where: { id: Number(groupId) } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, name } = data;
    if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 });
    const group = await prisma.group.update({ where: { id: Number(id) }, data: { name } });
    return NextResponse.json(group);
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar grupo' }, { status: 500 });
  }
}
