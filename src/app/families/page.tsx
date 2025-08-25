"use client";
import { useEffect, useState } from "react";
import { MembersList } from "@/components/MembersList";

interface Family {
  id: number;
  name: string;
  createdAt: string;
}

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFamilies();
  }, []);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar família");
      setName("");
      fetchFamilies();
    } catch {
      setError("Erro ao cadastrar família");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/families?familyId=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        if (data?.error?.includes("membros cadastrados")) {
          setError("Não é possível remover a família enquanto houver membros cadastrados. Remova todos os membros primeiro.");
        } else {
          setError("Erro ao remover família");
        }
        return;
      }
      fetchFamilies();
    } catch {
      setError("Erro ao remover família");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">Famílias</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Nome da família"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60"
        >
          Adicionar família
        </button>
      </form>
      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}
      <ul className="space-y-6">
        {families.map(family => (
          <li key={family.id} className="rounded bg-neutral-100 dark:bg-neutral-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">{family.name}</span>
              <button
                onClick={() => handleDelete(family.id)}
                className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-red-300"
              >
                Remover
              </button>
            </div>
            <MembersList familyId={family.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
