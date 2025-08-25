import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const familyId = searchParams.get('familyId');
  if (!familyId) {
    return NextResponse.json({ error: 'familyId é obrigatório' }, { status: 400 });
  }
  const bills = await prisma.bill.findMany({ where: { familyId: Number(familyId) } });
  return NextResponse.json(bills);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { familyId, name, value } = data;
  if (!familyId || !name || !value) {
    return NextResponse.json({ error: 'Campos obrigatórios: familyId, name, value' }, { status: 400 });
  }
  const bill = await prisma.bill.create({ data: { familyId: Number(familyId), name, value: Number(value) } });
  return NextResponse.json(bill, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const billId = searchParams.get('billId');
  if (!billId) {
    return NextResponse.json({ error: 'billId é obrigatório' }, { status: 400 });
  }
  await prisma.bill.delete({ where: { id: Number(billId) } });
  return NextResponse.json({ success: true });
}
