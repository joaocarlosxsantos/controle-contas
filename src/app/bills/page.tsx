"use client";
import { useEffect, useState } from "react";
import { BillCard } from "../../components/Cards";

interface Family {
  id: number;
  name: string;
  phone: string;
}

interface Bill {
  id: number;
  name: string;
  value: number;
  createdAt: string;
}

export default function BillsPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamily) fetchBills(selectedFamily);
    else setBills([]);
  }, [selectedFamily]);

  async function fetchFamilies() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/families");
      const data = await res.json();
      setFamilies(data);
    } catch {
      setError("Erro ao buscar famílias");
    } finally {
      setLoading(false);
    }
  }

  async function fetchBills(familyId: number) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bills?familyId=${familyId}`);
      const data = await res.json();
      setBills(data);
    } catch {
      setError("Erro ao buscar contas");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!selectedFamily) return;
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId: selectedFamily, name, value }),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar conta");
      setName("");
      setValue("");
      fetchBills(selectedFamily);
    } catch {
      setError("Erro ao cadastrar conta");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-xl bg-white p-8 shadow-lg dark:bg-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800">
      <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">Contas da família</h2>
      <label className="block mb-4">
        <span className="block mb-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">Selecione a família:</span>
        <select
          value={selectedFamily ?? ""}
          onChange={e => setSelectedFamily(Number(e.target.value) || null)}
          className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
        >
          <option value="">-- Escolha --</option>
          {families.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </label>
      {loading && <p className="text-blue-600 dark:text-blue-400">Carregando...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {selectedFamily && (
        <>
          <ul className="mb-4 space-y-3">
            {bills.map(b => (
              <li key={b.id}>
                <BillCard name={b.name} value={b.value} />
              </li>
            ))}
          </ul>
          <button
            className="mb-6 rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300"
            onClick={() => {
              window.open(`/api/export-csv?familyId=${selectedFamily}`, '_blank');
            }}
          >
            Exportar CSV
          </button>
          <hr className="my-6 border-neutral-200 dark:border-neutral-700" />
          <h3 className="font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Adicionar nova conta</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nome da conta"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
            />
            <input
              type="number"
              placeholder="Valor"
              value={value}
              onChange={e => setValue(e.target.value)}
              required
              min="0"
              step="0.01"
              className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60"
            >
              Adicionar
            </button>
          </form>
        </>
      )}
    </div>
  );
}
