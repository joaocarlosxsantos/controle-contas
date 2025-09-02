// PUT { id, name, value, shares }
export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, name, value, shares } = data;
  if (!id || !name || !value) {
    return NextResponse.json({ error: 'Campos obrigatórios: id, name, value' }, { status: 400 });
  }

  // shares: array de { memberId, type, amount }
  let bill;
  if (Array.isArray(shares) && shares.length > 0) {
    for (const s of shares) {
      if (!s.memberId || !s.type || typeof s.amount !== 'number') {
        return NextResponse.json({ error: 'Cada divisão deve ter memberId, type e amount' }, { status: 400 });
      }
    }
    if (shares.every(s => s.type === 'value')) {
      const sum = shares.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(sum - Number(value)) > 0.01) {
        return NextResponse.json({ error: 'A soma dos valores deve ser igual ao valor total da conta.' }, { status: 400 });
      }
    }
    if (shares.every(s => s.type === 'percent')) {
      const sum = shares.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(sum - 100) > 0.01) {
        return NextResponse.json({ error: 'A soma das porcentagens deve ser 100.' }, { status: 400 });
      }
    }
    // Atualiza a conta e substitui as divisões
    bill = await prisma.bill.update({
      where: { id: Number(id) },
      data: {
        name,
        value: Number(value),
        shares: {
          deleteMany: {}, // remove todas as divisões antigas
          create: shares.map(s => ({
            memberId: s.memberId,
            type: s.type,
            amount: s.amount,
          })),
        },
      },
      include: { shares: true },
    });
  } else {
    // Atualização padrão (sem shares personalizados)
    bill = await prisma.bill.update({
      where: { id: Number(id) },
      data: { name, value: Number(value) },
    });
  }
  return NextResponse.json(bill);
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bills?groupId=1  (opcional)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  if (!groupId) {
    const bills = await prisma.bill.findMany({
      orderBy: { createdAt: 'desc' },
      include: { group: true, shares: true },
    });
    return NextResponse.json(bills);
  }
  const bills = await prisma.bill.findMany({
    where: { groupId: Number(groupId) },
    orderBy: { createdAt: 'desc' },
    include: { shares: true },
  });
  return NextResponse.json(bills);
}

// POST { groupId, name, value, shares }
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { groupId, name, value, shares } = data;
  if (!groupId || !name || !value) {
    return NextResponse.json({ error: 'Campos obrigatórios: groupId, name, value' }, { status: 400 });
  }

  // shares: array de { memberId, type, amount }
  let bill;
  if (Array.isArray(shares) && shares.length > 0) {
    // Validação básica: todos os shares devem ter memberId, type e amount
    for (const s of shares) {
      if (!s.memberId || !s.type || typeof s.amount !== 'number') {
        return NextResponse.json({ error: 'Cada divisão deve ter memberId, type e amount' }, { status: 400 });
      }
    }
    // Se todos type forem 'value', soma deve ser igual ao valor
    if (shares.every(s => s.type === 'value')) {
      const sum = shares.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(sum - Number(value)) > 0.01) {
        return NextResponse.json({ error: 'A soma dos valores deve ser igual ao valor total da conta.' }, { status: 400 });
      }
    }
    // Se todos type forem 'percent', soma deve ser 100
    if (shares.every(s => s.type === 'percent')) {
      const sum = shares.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(sum - 100) > 0.01) {
        return NextResponse.json({ error: 'A soma das porcentagens deve ser 100.' }, { status: 400 });
      }
    }
    // Cria a conta e as divisões
    bill = await prisma.bill.create({
      data: {
        groupId: Number(groupId),
        name,
        value: Number(value),
        shares: {
          create: shares.map(s => ({
            memberId: s.memberId,
            type: s.type,
            amount: s.amount,
          })),
        },
      },
      include: { shares: true },
    });
  } else {
    // Criação padrão (divisão igualitária, sem shares personalizados)
    bill = await prisma.bill.create({ data: { groupId: Number(groupId), name, value: Number(value) } });
  }
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
