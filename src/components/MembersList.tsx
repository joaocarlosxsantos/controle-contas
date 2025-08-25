"use client";
import { useEffect, useState } from "react";

interface Member {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
}

export function MembersList({ familyId }: { familyId: number }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, [familyId]);

  async function fetchMembers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/members?familyId=${familyId}`);
      const data = await res.json();
      setMembers(data);
    } catch {
      setError("Erro ao buscar membros");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId, name, phone }),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar membro");
      setName("");
      setPhone("");
      fetchMembers();
    } catch {
      setError("Erro ao cadastrar membro");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setLoading(true);
    setError("");
    try {
      await fetch(`/api/members?memberId=${id}`, { method: "DELETE" });
      fetchMembers();
    } catch {
      setError("Erro ao remover membro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Membros da família</h4>
      {loading && <p className="text-blue-600 dark:text-blue-400">Carregando...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      <ul className="mb-4 space-y-2">
        {members.map(m => (
          <li key={m.id} className="flex items-center justify-between rounded bg-neutral-100 dark:bg-neutral-800 px-4 py-2">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">{m.name}</span>
            <span className="text-xs text-neutral-600 dark:text-neutral-300">{m.phone}</span>
            <button
              onClick={() => handleDelete(m.id)}
              className="ml-2 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-red-300"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Nome do membro"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
        />
        <input
          type="tel"
          placeholder="Telefone do membro"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60"
        >
          Adicionar membro
        </button>
      </form>
    </div>
  );
}
