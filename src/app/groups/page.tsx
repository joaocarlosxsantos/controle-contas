"use client";

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent dark:border-blue-600 dark:border-t-transparent"></div>
      <span className="mt-4 text-lg text-blue-700 dark:text-blue-300 font-semibold">Carregando...</span>
    </div>
  );
}
import { useEffect, useState } from "react";
import { MembersList } from "@/components/MembersList";
import { Modal } from "@/components/Modal";

interface Group {
  id: number;
  name: string;
  createdAt: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
    } catch {
      setError("Erro ao buscar grupos");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar grupo");
      setName("");
      setCreateModalOpen(false);
      fetchGroups();
    } catch {
      setError("Erro ao cadastrar grupo");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editGroup) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/groups`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editGroup.id, name: editName }),
      });
      if (!res.ok) throw new Error("Erro ao editar grupo");
      setEditModalOpen(false);
      setEditGroup(null);
      fetchGroups();
    } catch {
      setError("Erro ao editar grupo");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-3xl border border-neutral-200/70 bg-white p-6 md:p-10 shadow-xl dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex-1 min-w-0 md:min-w-[260px]">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-100 mb-2">Grupos</h1>
          <p className="max-w-2xl text-base text-neutral-600 dark:text-neutral-400">Crie e edite os grupos que irão agrupar suas contas e membros.</p>
        </div>
        <div className="flex flex-col gap-4 md:gap-6 md:w-auto md:items-center">
          <div className="flex items-center rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-lg shadow-md focus-within:ring-2 focus-within:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 min-w-0 md:min-w-[320px]">
            <input
              placeholder="Buscar grupo..."
              value={""}
              onChange={() => {}}
              className="w-full bg-transparent outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-lg"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300"
            >
              Criar grupo
            </button>
          </div>
        </div>
      </header>
      {loading && <LoadingSpinner />}
      {error && <p className="text-lg text-red-600 dark:text-red-400 mb-6">{error}</p>}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {groups.map(group => (
          <div
            key={group.id}
            className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-950/40 dark:border-blue-800 p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all group flex flex-col gap-3 min-h-[180px]"
            onClick={() => {
              setEditGroup(group);
              setEditName(group.name);
              setEditModalOpen(true);
            }}
            tabIndex={0}
            role="button"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-blue-200/70 dark:bg-blue-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-blue-700 dark:text-blue-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 16.5a7.488 7.488 0 00-5.982 2.225M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm6 2.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-16.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-2xl text-blue-900 dark:text-blue-100 line-clamp-1">{group.name}</div>
                <div className="text-base text-neutral-500 dark:text-neutral-400">Criado em {new Date(group.createdAt).toLocaleDateString("pt-BR")}</div>
              </div>
            </div>
            <div className="mt-2">
              <MembersList groupId={group.id} showForm={false} compact={true} />
            </div>
          </div>
        ))}
      </div>

      {/* Modal de criar grupo */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Criar grupo">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome do grupo"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">Cancelar</button>
            <button type="submit" disabled={loading} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60">Criar</button>
          </div>
        </form>
      </Modal>

      {/* Modal de editar grupo e membros */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar grupo">
        <form onSubmit={handleEdit} className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Nome do grupo"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            required
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setEditModalOpen(false)} className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">Cancelar</button>
            <button type="submit" disabled={loading} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60">Salvar</button>
          </div>
        </form>
        {editGroup && <MembersList groupId={editGroup.id} />}
      </Modal>
  </div>
  );
}
