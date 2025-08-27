// PUT { id, name, value }
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, name, value } = data;
  if (!id || !name || !value) {
    return NextResponse.json({ error: 'Campos obrigatórios: id, name, value' }, { status: 400 });
  }
  const bill = await prisma.bill.update({
    where: { id: Number(id) },
    data: { name, value: Number(value) },
  });
  return NextResponse.json(bill);
}
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/bills?groupId=1  (opcional)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  if (!groupId) {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: 'desc' },
      include: { group: true },
    });
    return NextResponse.json(bills);
  }
  const bills = await prisma.bill.findMany({ where: { groupId: Number(groupId) }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(bills);
}

// POST { groupId, name, value }
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { groupId, name, value } = data;
  if (!groupId || !name || !value) {
    return NextResponse.json({ error: 'Campos obrigatórios: groupId, name, value' }, { status: 400 });
  }
  const bill = await prisma.bill.create({ data: { groupId: Number(groupId), name, value: Number(value) } });
  return NextResponse.json(bill, { status: 201 });
}

// DELETE /api/bills?billId=1
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const billId = searchParams.get('billId');
  if (!billId) {
    return NextResponse.json({ error: 'billId é obrigatório' }, { status: 400 });
  }
  await prisma.bill.delete({ where: { id: Number(billId) } });
  return NextResponse.json({ success: true });
}
