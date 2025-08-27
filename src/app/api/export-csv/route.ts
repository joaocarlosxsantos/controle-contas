import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'groupId é obrigatório' }, { status: 400 });
  }
  const bills = await prisma.bill.findMany({ where: { groupId: Number(groupId) } });
  if (!bills.length) {
    return NextResponse.json({ error: 'Nenhuma conta encontrada para este grupo.' }, { status: 404 });
  }
  const csv = [
    'Nome,Valor',
    ...bills.map((b: { name: string; value: number }) => `${b.name},${b.value.toFixed(2)}`)
  ].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=divisao-contas-grupo-${groupId}.csv`
    }
  });
}
