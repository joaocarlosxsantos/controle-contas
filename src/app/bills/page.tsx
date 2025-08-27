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
import { BillCard } from "../../components/Cards";
import { Modal } from "../../components/Modal";

interface Group {
  id: number;
  name: string;
}
// Removed unused import
interface Member {
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  // Seleciona grupo automaticamente se groupId estiver na URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const groupIdParam = params.get("groupId");
      if (groupIdParam) {
        setSelectedGroup(Number(groupIdParam));
      }
    }
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchBills(selectedGroup);
      fetchMembers(selectedGroup);
    } else {
      setBills([]);
      setMembers([]);
    }
  }, [selectedGroup]);
  async function fetchMembers(groupId: number) {
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

  async function fetchBills(groupId: number) {
    setLoading(true);
    setError("");
    try {
    const res = await fetch(`/api/bills?groupId=${groupId}`);
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
      if (!selectedGroup) return;
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selectedGroup, name, value }),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar conta");
      setName("");
      setValue("");
      setAddModalOpen(false);
      fetchBills(selectedGroup);
    } catch {
      setError("Erro ao cadastrar conta");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="w-full max-w-5xl mx-auto px-2 md:px-8 py-10 flex flex-col gap-12">
      <h2 className="text-4xl font-extrabold mb-8 text-emerald-900 dark:text-emerald-100">Contas do grupo</h2>
      <label className="block mb-8">
        <span className="block mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Selecione o grupo:</span>
        <select
          value={selectedGroup ?? ""}
          onChange={e => setSelectedGroup(Number(e.target.value) || null)}
          className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-5 py-3 text-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 shadow-md"
        >
          <option value="">-- Escolha --</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </label>
  {loading && <LoadingSpinner />}
      {error && <p className="text-lg text-red-600 dark:text-red-400">{error}</p>}
      {selectedGroup && (
        <>
          <ul className="mb-8 space-y-6">
            {bills.map(bill => (
              <li key={bill.id}>
                <BillCard name={bill.name} value={bill.value}>
                  <div className="flex gap-4 ml-auto">
                    <button
                      className="rounded-xl px-4 py-2 text-base font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 transition"
                      onClick={() => {
                        setSelectedBill(bill);
                        setEditName(bill.name);
                        setEditValue(bill.value.toString());
                        setEditModalOpen(true);
                      }}
                    >Editar</button>
                    <button
                      className="rounded-xl px-4 py-2 text-base font-semibold bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition"
                      onClick={() => {
                        setSelectedBill(bill);
                        setDeleteModalOpen(true);
                      }}
                    >Excluir</button>
                  </div>
                </BillCard>
              </li>
            ))}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Conta">
        <form
          onSubmit={async e => {
            e.preventDefault();
            if (!selectedBill) return;
            setLoading(true);
            setError("");
            try {
              const res = await fetch(`/api/bills`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedBill.id, name: editName, value: editValue }),
              });
              if (!res.ok) throw new Error("Erro ao editar conta");
              setEditModalOpen(false);
              fetchBills(selectedGroup!);
            } catch {
              setError("Erro ao editar conta");
            } finally {
              setLoading(false);
            }
          }}
          className="flex flex-col gap-3"
        >
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            required
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
            placeholder="Nome da conta"
          />
          <input
            type="number"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            required
            min="0"
            step="0.01"
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
            placeholder="Valor"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setEditModalOpen(false)} className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">Cancelar</button>
            <button type="submit" className="rounded px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400">Salvar</button>
          </div>
        </form>
      </Modal>

      {/* Modal de exclusão */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Excluir Conta">
        <div className="mb-4">Tem certeza que deseja excluir a conta <span className="font-bold">{selectedBill?.name}</span>?</div>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteModalOpen(false)} className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">Cancelar</button>
          <button
            onClick={async () => {
              if (!selectedBill) return;
              setLoading(true);
              setError("");
              try {
                const res = await fetch(`/api/bills?billId=${selectedBill.id}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Erro ao excluir conta");
                setDeleteModalOpen(false);
                fetchBills(selectedGroup!);
              } catch {
                setError("Erro ao excluir conta");
              } finally {
                setLoading(false);
              }
            }}
            className="rounded px-4 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
          >Excluir</button>
        </div>
      </Modal>
          </ul>

          {/* Subtotal e divisão */}
          <div className="mb-10 rounded-3xl bg-emerald-50 dark:bg-emerald-900/30 p-8 flex flex-col gap-4 border border-emerald-200 dark:border-emerald-800 shadow-md">
            <div className="text-emerald-900 dark:text-emerald-200 text-xl font-bold">
              Subtotal: <span className="font-extrabold">R$ {bills.reduce((acc, b) => acc + b.value, 0).toFixed(2)}</span>
            </div>
            <div className="text-emerald-900 dark:text-emerald-200 text-xl font-bold">
              Pessoas no grupo: <span className="font-extrabold">{members.length}</span>
            </div>
            <div className="text-emerald-900 dark:text-emerald-200 text-xl font-bold">
              Total por pessoa: <span className="font-extrabold">R$ {members.length > 0 ? (bills.reduce((acc, b) => acc + b.value, 0) / members.length).toFixed(2) : "0.00"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              className="rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-300"
              onClick={() => setAddModalOpen(true)}
            >
              Adicionar conta
            </button>
            <button
              className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300"
              onClick={() => {
                window.open(`/api/export-csv?groupId=${selectedGroup}`, '_blank');
              }}
            >
              Exportar CSV
            </button>
          </div>
          <hr className="my-6 border-neutral-200 dark:border-neutral-700" />

          {/* Modal de cadastro de conta */}
          <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Adicionar nova conta">
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
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setAddModalOpen(false)} className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">Cancelar</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white shadow transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-300 disabled:opacity-60"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
