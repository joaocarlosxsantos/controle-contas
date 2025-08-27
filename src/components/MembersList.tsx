"use client";
import { useEffect, useState } from "react";
function maskPhone(phone: string) {
  // Máscara para (99) 99999-9999 ou (99) 9999-9999
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length >= 11)
    return cleaned.replace(/(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  if (cleaned.length >= 10)
    return cleaned.replace(/(\d{2})(\d{4})(\d{4}).*/, "($1) $2-$3");
  return phone;
}

interface Member {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
}

interface MembersListProps {
  groupId: number;
  showForm?: boolean;
  compact?: boolean;
}

export function MembersList({ groupId, showForm = true, compact = false }: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, [groupId]);

  async function fetchMembers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/members?groupId=${groupId}`);
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
        body: JSON.stringify({ groupId, name, phone }),
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
    <div className="mt-2">
      {!compact && <h4 className="font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Membros do grupo</h4>}
      {loading && <p className="text-blue-600 dark:text-blue-400">Carregando...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {compact ? (
        <div className="flex flex-wrap gap-2">
          {members.length === 0 && <span className="text-xs text-neutral-500 dark:text-neutral-400">Nenhum membro cadastrado.</span>}
          {members.map(m => (
            <span key={m.id} className="inline-flex flex-col rounded-full bg-blue-100 dark:bg-blue-800 px-3 py-2 text-sm font-semibold text-blue-800 dark:text-blue-100 min-w-[110px]">
              <span className="leading-tight text-base md:text-lg">{m.name}</span>
              <span className="text-xs md:text-base text-neutral-500 dark:text-neutral-300 leading-tight">{maskPhone(m.phone)}</span>
            </span>
          ))}
        </div>
      ) : (
        <ul className="mb-2 space-y-2">
          {members.length === 0 && <li className="text-xs text-neutral-500 dark:text-neutral-400">Nenhum membro cadastrado.</li>}
          {members.map(m => (
            <li key={m.id} className="flex flex-col rounded bg-neutral-100 dark:bg-neutral-800 px-4 py-3">
              <span className="font-semibold text-base md:text-lg text-neutral-900 dark:text-neutral-100">{m.name}</span>
              <span className="text-sm md:text-base text-neutral-600 dark:text-neutral-300 mt-1">{maskPhone(m.phone)}</span>
              {showForm && (
                <button
                  onClick={() => handleDelete(m.id)}
                  className="mt-2 self-end rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-red-300"
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {showForm && !compact && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Nome do membro"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-lg md:text-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
          />
          <input
            type="tel"
            placeholder="Telefone do membro"
            value={phone}
            onChange={e => {
              // Aplica máscara ao digitar
              const cleaned = e.target.value.replace(/\D/g, "");
              let masked = cleaned;
              if (cleaned.length > 11) masked = cleaned.slice(0, 11);
              if (masked.length >= 11)
                masked = masked.replace(/(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
              else if (masked.length >= 10)
                masked = masked.replace(/(\d{2})(\d{4})(\d{4}).*/, "($1) $2-$3");
              e.target.value = masked;
              setPhone(masked);
            }}
            required
            maxLength={15}
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-lg md:text-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-lg md:text-xl font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60"
          >
            Adicionar membro
          </button>
        </form>
      )}
    </div>
  );
}
export default MembersList;
