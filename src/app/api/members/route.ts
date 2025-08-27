// Função utilitária para recalcular contas após remoção de membro
async function recalculateBillsForRemovedMember(memberId: number) {
  // Busca todas as contas que tinham esse membro
  const affectedBills = await prisma.bill.findMany({
    where: {
      shares: {
        some: { memberId: memberId }
      }
    },
    include: { shares: true }
  });
  for (const bill of affectedBills) {
    // Remove o share do membro já foi feito, agora recalcula se sobrou pelo menos 1 share
    const remainingShares = bill.shares.filter(s => s.memberId !== memberId);
    if (remainingShares.length === 0) continue; // não recalcula se não sobrou ninguém
    // Se todos os shares são do tipo 'value', rebalanceia igualitariamente
    if (remainingShares.every(s => s.type === 'value')) {
      const base = Math.floor((bill.value / remainingShares.length) * 100) / 100;
      const rest = bill.value - base * remainingShares.length;
      await Promise.all(remainingShares.map((s, i) =>
        prisma.billMemberShare.update({
          where: { id: s.id },
          data: { amount: base + (i === 0 ? rest : 0) }
        })
      ));
    }
    // Se todos os shares são do tipo 'percent', rebalanceia igualitariamente
    if (remainingShares.every(s => s.type === 'percent')) {
      const base = Math.floor((100 / remainingShares.length) * 100) / 100;
      const rest = 100 - base * remainingShares.length;
      await Promise.all(remainingShares.map((s, i) =>
        prisma.billMemberShare.update({
          where: { id: s.id },
          data: { amount: base + (i === 0 ? rest : 0) }
        })
      ));
    }
    // Se for misto, não faz nada (caso raro)
  }
}
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
  const force = searchParams.get('force');
  if (!memberId) {
    return NextResponse.json({ error: 'memberId é obrigatório' }, { status: 400 });
  }
  try {
    if (force === '1') {
      // Remove todos os vínculos BillMemberShare desse membro
      await prisma.billMemberShare.deleteMany({ where: { memberId: Number(memberId) } });
      // Recalcula as contas afetadas
      await recalculateBillsForRemovedMember(Number(memberId));
    }
    await prisma.member.delete({ where: { id: Number(memberId) } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      typeof (e as { code?: unknown }).code === 'string' &&
      (e as { code: string }).code === 'P2003'
    ) {
      return NextResponse.json({ error: 'Membro possui contas vinculadas.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Erro ao remover membro.' }, { status: 500 });
  }
}
