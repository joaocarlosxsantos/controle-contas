"use client";

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent dark:border-blue-600 dark:border-t-transparent"></div>
      <span className="mt-4 text-lg text-blue-700 dark:text-blue-300 font-semibold">
        Carregando...
      </span>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { MembersList } from "@/components/MembersList";
import { Modal } from "@/components/Modal";

interface Group {
  id: number;
  name: string;
  createdAt: string;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, searchQuery]);

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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-100 mb-2">
            Grupos
          </h1>
          <p className="max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
            Crie e edite os grupos que irão agrupar suas contas e membros.
          </p>
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="flex-1 min-w-0">
            <div className="flex items-center rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-lg shadow-md focus-within:ring-2 focus-within:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800">
              <input
                placeholder="Buscar grupo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-lg"
              />
            </div>
          </div>
          <div>
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
      {error && (
        <p className="text-lg text-red-600 dark:text-red-400 mb-6">{error}</p>
      )}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              setEditGroup(group);
              setEditName(group.name);
              setEditModalOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setEditGroup(group);
                setEditName(group.name);
                setEditModalOpen(true);
              }
            }}
            className="relative rounded-2xl border border-blue-100 bg-white hover:bg-blue-50 dark:bg-neutral-900 dark:border-neutral-800 p-4 sm:p-5 transition-shadow hover:shadow-md clickable"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 line-clamp-1">
                    {group.name}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Criado em{" "}
                    {new Date(group.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                {/* ações movedas para o modal de edição */}
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"
                  aria-hidden
                >
                  {/* visual-only placeholder to preserve spacing on hover */}
                  <div className="h-6" />
                </div>
              </div>
              <div className="mt-3">
                <MembersList
                  groupId={group.id}
                  showForm={false}
                  compact={true}
                />
              </div>
            </div>
          </div>
        ))}
        {!loading && filteredGroups.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-neutral-300 p-16 text-center text-lg text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            Nenhum grupo encontrado.
          </div>
        )}
      </div>

      {/* Modal de criar grupo */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Criar grupo"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome do grupo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60"
            >
              Criar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de editar grupo e membros */}
      <Modal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setConfirmDelete(false);
        }}
        title="Editar grupo"
      >
        <form onSubmit={handleEdit} className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="Nome do grupo"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
          />
          <div className="flex justify-end gap-2 mt-2">
            {editGroup && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded px-4 py-2 bg-red-200 dark:bg-red-800 text-neutral-800 dark:text-neutral-200"
              >
                Excluir grupo
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60"
            >
              Salvar
            </button>
          </div>
        </form>
        {editGroup && <MembersList groupId={editGroup.id} />}
        {/* botão de excluir dentro do modal de edição */}
        {/* modal de confirmação de exclusão */}
        <Modal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          title="Confirmar exclusão"
        >
          <div className="mb-4">
            Tem certeza que deseja excluir o grupo <b>{editGroup?.name}</b>?
            Essa ação não pode ser desfeita.
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                if (!editGroup) return;
                setLoading(true);
                setError("");
                try {
                  const res = await fetch(
                    `/api/groups?groupId=${editGroup.id}`,
                    { method: "DELETE" }
                  );
                  if (!res.ok) throw new Error("Erro ao excluir grupo");
                  // Fechar ambos os modais e recarregar
                  setConfirmDelete(false);
                  setEditModalOpen(false);
                  setEditGroup(null);
                  await fetchGroups();
                } catch {
                  setError(
                    "Erro ao excluir grupo. Verifique se não há membros vinculados."
                  );
                } finally {
                  setLoading(false);
                }
              }}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </Modal>
      </Modal>
    </div>
  );
}
