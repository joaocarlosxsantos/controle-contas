"use client";

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent dark:border-blue-600 dark:border-t-transparent"></div>
      <span className="mt-4 text-lg text-blue-700 dark:text-blue-300 font-semibold">Carregando...</span>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { BillCard } from "../components/Cards";

interface BillWithGroup {
  id: number;
  name: string;
  value: number;
  createdAt: string;
  group: { id: number; name: string };
}

export default function Home() {
  const [bills, setBills] = useState<BillWithGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [] = useState<BillWithGroup | null>(null);

  useEffect(() => {
    fetchBills();
  }, []);

  async function fetchBills() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bills");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro");
      setBills(data);
      // Buscar quantidade de membros de cada grupo
      const groupIds: number[] = Array.from(new Set(data.map((b: BillWithGroup) => b.group.id)));
      const membersObj: Record<number, number> = {};
      await Promise.all(
        groupIds.map(async (groupId) => {
          const res = await fetch(`/api/members?groupId=${groupId}`);
          const members = await res.json();
          membersObj[groupId] = Array.isArray(members) ? members.length : 0;
        })
      );
      setGroupMembers(membersObj);
    } catch {
      setError("Erro ao carregar contas");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
  return bills.filter(b => b.name.toLowerCase().includes(q) || b.group.name.toLowerCase().includes(q));
  }, [bills, query]);

  const total = useMemo(() => bills.reduce((sum, b) => sum + b.value, 0), [bills]);

  return (
    <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 rounded-3xl border border-neutral-200/70 bg-white/80 p-10 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex-1 min-w-[260px]">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2">Visão Geral de Contas</h1>
          <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Acompanhe rapidamente as contas cadastradas em todos os grupos. Clique em um card para ver detalhes.
          </p>
        </div>
        <div className="flex flex-col gap-4 md:gap-6 md:w-auto md:items-center">
          <div className="flex items-center rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-lg shadow-md focus-within:ring-2 focus-within:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 min-w-[320px]">
            <input
              placeholder="Buscar conta ou grupo..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-lg"
            />
          </div>
          <div className="flex gap-4">
            <a
              href="/groups"
              className="group rounded-2xl border border-blue-200/60 bg-blue-50 px-6 py-3 text-lg font-semibold text-blue-700 shadow-md transition hover:bg-blue-100 hover:shadow-lg dark:border-blue-800/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
            >
              Gerenciar Grupos
            </a>
            <a
              href="/bills"
              className="group rounded-2xl border border-emerald-200/60 bg-emerald-50 px-6 py-3 text-lg font-semibold text-emerald-700 shadow-md transition hover:bg-emerald-100 hover:shadow-lg dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
            >
              Adicionar Contas
            </a>
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-10">
        <div className="flex flex-wrap gap-8">
          <div className="flex-1 min-w-[220px] rounded-3xl border border-neutral-200 bg-white px-8 py-6 text-lg shadow-md dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-sm uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Total de Contas</div>
            <div className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">{bills.length}</div>
          </div>
          <div className="flex-1 min-w-[220px] rounded-3xl border border-neutral-200 bg-white px-8 py-6 text-lg shadow-md dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-sm uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Valor Somado</div>
            <div className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">R$ {total.toFixed(2)}</div>
          </div>
          <div className="flex-1 min-w-[220px] rounded-3xl border border-neutral-200 bg-white px-8 py-6 text-lg shadow-md dark:border-neutral-800 dark:bg-neutral-900">
            <div className="text-sm uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Filtradas</div>
            <div className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">{filtered.length}</div>
          </div>
        </div>

  {loading && <LoadingSpinner />}
        {error && <p className="text-lg text-red-600 dark:text-red-400">{error}</p>}

        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {Object.entries(
            filtered.reduce((acc, bill) => {
              const groupId = bill.group.id;
              if (!acc[groupId]) acc[groupId] = { name: bill.group.name, bills: [] };
              acc[groupId].bills.push(bill);
              return acc;
            }, {} as Record<number, { name: string; bills: BillWithGroup[] }>)
          ).map(([groupId, groupData]) => {
            const subtotal = groupData.bills.reduce((sum, b) => sum + b.value, 0);
            const membersCount = groupMembers[Number(groupId)] ?? 0;
            const perPerson = membersCount > 0 ? subtotal / membersCount : 0;
            return (
              <div
                key={groupId}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 p-8 cursor-pointer hover:shadow-2xl transition flex flex-col gap-4 min-h-[260px]"
                onClick={() => window.location.href = `/bills?groupId=${groupId}`}
                tabIndex={0}
                role="button"
              >
                <h3 className="mb-2 text-2xl font-bold text-emerald-800 dark:text-emerald-200">{groupData.name}</h3>
                <div className="flex flex-col gap-1 text-emerald-900 dark:text-emerald-200 text-lg font-medium">
                  <span>Subtotal: <span className="font-bold">R$ {subtotal.toFixed(2)}</span></span>
                  <span>Pessoas no grupo: <span className="font-bold">{membersCount}</span></span>
                  <span>Total por pessoa: <span className="font-bold">R$ {perPerson.toFixed(2)}</span></span>
                </div>
                <ul className="space-y-2">
                  {groupData.bills.map(bill => (
                    <li key={bill.id}>
                      <BillCard
                        name={bill.name}
                        value={bill.value}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {!loading && !filtered.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-neutral-300 p-16 text-center text-lg text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              Nenhuma conta encontrada.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
