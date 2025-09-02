import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/members/has-links?memberId=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get('memberId');
  if (!memberId) {
    return NextResponse.json({ error: 'memberId é obrigatório' }, { status: 400 });
  }
  // Verifica se existe algum BillMemberShare para esse membro
  const count = await prisma.billMemberShare.count({ where: { memberId: Number(memberId) } });
  return NextResponse.json({ hasLinks: count > 0 });
}
