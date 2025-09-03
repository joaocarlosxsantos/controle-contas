import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'groupId é obrigatório' }, { status: 400 });
  }
  const bills = await prisma.bill.findMany({
    where: { groupId: Number(groupId) },
    include: { shares: { include: { member: true } } },
  });
  if (!bills.length) {
    return NextResponse.json({ error: 'Nenhuma conta encontrada para este grupo.' }, { status: 404 });
  }
  // CSV columns: Conta,Valor Total,Membro,Valor Por Membro
  const header = ['Conta', 'Valor Total', 'Membro', 'Valor Por Membro'];
  const lines: string[] = [header.join(',')];

  for (const b of bills) {
    // se não houver shares, registrar a linha com membro vazio
    if (!b.shares || b.shares.length === 0) {
      lines.push([escapeCsv(b.name), b.value.toFixed(2), '', ''].join(','));
      continue;
    }

    for (const s of b.shares) {
      // calculo do valor por membro: se type === 'percent', usa porcentagem, senão usa amount como valor fixo
      let memberValue = 0;
      if (s.type === 'percent') {
        memberValue = (s.amount / 100) * b.value;
      } else {
        memberValue = s.amount;
      }
      lines.push([escapeCsv(b.name), b.value.toFixed(2), escapeCsv(s.member.name), memberValue.toFixed(2)].join(','));
    }
  }

  const csv = lines.join('\n');
  // prefix with UTF-8 BOM so Excel/Windows recognize encoding corretamente
  const BOM = '\uFEFF';
  const csvWithBom = BOM + csv;

  function escapeCsv(v: unknown): string {
    if (v === null || v === undefined) return '';
    const str = String(v);
    // se contém vírgula, aspas ou nova linha, envolva em aspas e escape aspas internas
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }
  const filename = `divisao-contas-grupo-${groupId}.csv`;
  // RFC 5987 filename* for UTF-8 filenames
  const filenameStar = "UTF-8''" + encodeURIComponent(filename);
  return new NextResponse(csvWithBom, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"; filename*=${filenameStar}`
    }
  });
}
