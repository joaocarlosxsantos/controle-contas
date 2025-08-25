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
  if (!bills.length) {
    return NextResponse.json({ error: 'Nenhuma conta encontrada para esta família.' }, { status: 404 });
  }
  const csv = [
    'Nome,Valor',
    ...bills.map((b: { name: string; value: number }) => `${b.name},${b.value.toFixed(2)}`)
  ].join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=divisao-contas-familia-${familyId}.csv`
    }
  });
}
