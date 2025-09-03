  "use client";

  import { useEffect, useState } from "react";
  import { BillCard } from "../../components/Cards";
  import { Modal } from "../../components/Modal";

  function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent dark:border-blue-600 dark:border-t-transparent"></div>
      <span className="mt-4 text-lg text-blue-700 dark:text-blue-300 font-semibold">Carregando...</span>
    </div>
  );
}

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
interface BillShare {
  id: number;
  memberId: number;
  type: 'value' | 'percent';
  amount: number;
}
interface Bill {
  id: number;
  name: string;
  value: number;
  createdAt: string;
  shares?: BillShare[];
}

export default function BillsPage() {
  // Flag para saber se o modal de edição já foi aberto pelo usuário
  const [editInitialized, setEditInitialized] = useState(false);
  // --- Funções de edição (após todos os hooks de estado) ---
  function handleOpenEditModal(bill: Bill) {
  setEditInitialized(false);
    setSelectedBill(bill);
    setEditName(bill.name);
    setEditValue(bill.value.toString());
    if (bill.shares && Array.isArray(bill.shares) && bill.shares.length > 0) {
      // Descobre tipo salvo (todos shares devem ter o mesmo type)
      const typeSalvo = bill.shares[0].type === 'percent' ? 'percent' : 'value';
      setEditShareType(typeSalvo);
      // Participantes salvos
      const membrosIncluidos = bill.shares.map((s) => s.memberId);
      // Se todos do grupo participam, deixa array vazio (equivale a "Todos" marcado)
      if (membrosIncluidos.length === members.length) {
        setEditSelectedMembers([]);
      } else {
        setEditSelectedMembers(membrosIncluidos);
      }
      // Preenche os valores/porcentagens conforme banco
      setEditShares(bill.shares.map((s) => ({ memberId: s.memberId, amount: s.amount })));
    } else {
      setEditShareType('value');
      setEditSelectedMembers([]);
      setEditShares(getEqualShares('value', bill.value.toString(), members.map(m => m.id)));
    }
    setEditModalOpen(true);
  setTimeout(() => setEditInitialized(true), 0); // ativa flag após abrir modal
  }

  // Estados para edição de divisão personalizada
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editShareType, setEditShareType] = useState<'value' | 'percent'>('value');
  const [editSelectedMembers, setEditSelectedMembers] = useState<number[]>([]);
  const [editShares, setEditShares] = useState<{ memberId: number; amount: number }[]>([]);

  // (deixe o useEffect de edição APÓS a declaração dos hooks de estado editValue e members)
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  // Estado para divisão personalizada
  const [shareType, setShareType] = useState<'value' | 'percent'>('value');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]); // vazio = todos
  const [shares, setShares] = useState<{ memberId: number; amount: number }[]>([]);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");
  // Estado para modal de erro de validação
  const [validationError, setValidationError] = useState("");
  // Atualiza shares ao mudar participantes, valor ou tipo (edição)
  // Só recalcula shares de edição se o usuário alterar algo DEPOIS de abrir o modal
  useEffect(() => {
    if (!editModalOpen || !editInitialized) return;
    // Só recalcula se houve alteração manual após abrir
    setEditInitialized(false); // reseta flag para não rodar novamente até próxima alteração
    const ids = editSelectedMembers.length === 0 ? members.map(m => m.id) : editSelectedMembers;
    setEditShares(getEqualShares(editShareType, editValue, ids));
    // eslint-disable-next-line
  }, [editSelectedMembers, editValue, editShareType, members.length, editModalOpen]);

  // Helper para divisão igualitária
  function getEqualShares(type: 'value' | 'percent', value: string, members: number[]): { memberId: number; amount: number }[] {
    if (!members.length) return [];
    if (type === 'value') {
      const v = parseFloat(value) || 0;
      const base = Math.floor((v / members.length) * 100) / 100;
  const rest = v - base * members.length;
      return members.map((id, i) => ({ memberId: id, amount: base + (i === 0 ? rest : 0) }));
    } else {
      const base = Math.floor((100 / members.length) * 100) / 100;
  const rest = 100 - base * members.length;
      return members.map((id, i) => ({ memberId: id, amount: base + (i === 0 ? rest : 0) }));
    }
  }

  // Sempre que abrir o modal, selecionar todos por padrão e dividir igualmente
  function handleOpenAddModal() {
    setAddModalOpen(true);
    setSelectedMembers([]); // todos
    setShares(getEqualShares(shareType, value, members.map(m => m.id)));
  }

  // Atualiza shares ao mudar participantes, valor ou tipo
  useEffect(() => {
    const ids = selectedMembers.length === 0 ? members.map(m => m.id) : selectedMembers;
    setShares(getEqualShares(shareType, value, ids));
    // eslint-disable-next-line
  }, [selectedMembers, value, shareType, members.length]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
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
  // Validação de soma
  const ids = selectedMembers.length === 0 ? members.map(m => m.id) : selectedMembers;
    if (shareType === 'value') {
      const soma = ids.reduce((acc, id) => acc + (shares.find(s => s.memberId === id)?.amount ?? 0), 0);
      const total = parseFloat(value) || 0;
      if (Math.abs(soma - total) > 0.01) {
        setValidationError("A soma dos valores dos participantes deve ser igual ao valor total da conta.");
        setLoading(false);
        return;
      }
    } else {
      const soma = ids.reduce((acc, id) => acc + (shares.find(s => s.memberId === id)?.amount ?? 0), 0);
      if (Math.abs(soma - 100) > 0.01) {
        setValidationError("A soma das porcentagens dos participantes deve ser igual a 100%.");
        setLoading(false);
        return;
      }
    }
    try {
      if (!selectedGroup) return;
      // Monta shares para API
      const allIds = selectedMembers.length === 0 ? members.map(m => m.id) : selectedMembers;
      const sharesPayload = allIds.map(memberId => ({
        memberId,
        type: shareType,
        amount: shares.find(s => s.memberId === memberId)?.amount ?? 0,
      }));
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selectedGroup, name, value, shares: sharesPayload }),
      });
      if (!res.ok) throw new Error("Erro ao cadastrar conta");
      setName("");
      setValue("");
      setSelectedMembers([]);
      setShares([]);
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
      {/* Modal de erro de validação - sempre visível */}
      <div style={{ zIndex: 9999, position: 'relative' }}>
        <Modal open={!!validationError} onClose={() => setValidationError("")} title="Erro de validação">
          <div className="mb-4 text-red-700 dark:text-red-300 font-semibold">{validationError}</div>
          <div className="flex justify-end">
            <button onClick={() => setValidationError("")} className="rounded px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">Fechar</button>
          </div>
        </Modal>
      </div>
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
                  {bill.shares && bill.shares.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs text-emerald-900 dark:text-emerald-200 ml-4">
                      {bill.shares.map(share => {
                        const member = members.find(m => m.id === share.memberId);
                        let valor = 0;
                        if (share.type === 'value') valor = share.amount;
                        if (share.type === 'percent') valor = (share.amount * bill.value) / 100;
                        return (
                          <div key={share.memberId} className="flex gap-2 items-center">
                            <span className="font-semibold">{member?.name || 'Membro'}</span>
                            <span>R$ {valor.toFixed(2)}</span>
                            {share.type === 'percent' && <span className="text-emerald-700 dark:text-emerald-300">({share.amount.toFixed(1)}%)</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-4 ml-auto">
                    <button
                      className="rounded-xl px-4 py-2 text-base font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800 transition"
                  onClick={() => handleOpenEditModal(bill)}
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
            // Validação de soma
            const ids = editSelectedMembers.length === 0 ? members.map(m => m.id) : editSelectedMembers;
            if (editShareType === 'value') {
              const soma = ids.reduce((acc, id) => acc + (editShares.find(s => s.memberId === id)?.amount ?? 0), 0);
              const total = parseFloat(editValue) || 0;
              if (Math.abs(soma - total) > 0.01) {
                setValidationError("A soma dos valores dos participantes deve ser igual ao valor total da conta.");
                setLoading(false);
                return;
              }
            } else {
              const soma = ids.reduce((acc, id) => acc + (editShares.find(s => s.memberId === id)?.amount ?? 0), 0);
              if (Math.abs(soma - 100) > 0.01) {
                setValidationError("A soma das porcentagens dos participantes deve ser igual a 100%.");
                setLoading(false);
                return;
              }
            }
            try {
              // Monta shares para API
              const allIds = editSelectedMembers.length === 0 ? members.map(m => m.id) : editSelectedMembers;
              const sharesPayload = allIds.map(memberId => ({
                memberId,
                type: editShareType,
                amount: editShares.find(s => s.memberId === memberId)?.amount ?? 0,
              }));
              const res = await fetch(`/api/bills`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedBill.id, name: editName, value: editValue, shares: sharesPayload }),
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
            step="0.01"
            className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100"
            placeholder="Valor"
          />
          <div>
            <label className="block font-semibold mb-1">Participantes:</label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1 font-semibold">
                <input
                  type="checkbox"
                  checked={editSelectedMembers.length === 0}
                  onChange={() => {
                    if (editSelectedMembers.length === 0) {
                      // Desmarcar todos
                      setEditSelectedMembers(members.map(m => m.id));
                    } else {
                      // Marcar todos
                      setEditSelectedMembers([]);
                    }
                  }}
                />
                Todos
              </label>
              {members.map(m => (
                <label key={m.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editSelectedMembers.length === 0 || editSelectedMembers.includes(m.id)}
                    onChange={e => {
                      let newSelected;
                      if (editSelectedMembers.length === 0) {
                        // Se estava "Todos", remover só esse
                        newSelected = members.filter(mem => mem.id !== m.id).map(mem => mem.id);
                      } else if (e.target.checked) {
                        newSelected = [...editSelectedMembers, m.id];
                      } else {
                        newSelected = editSelectedMembers.filter(id => id !== m.id);
                      }
                      // Se todos marcados individualmente, ativa "Todos"
                      if (newSelected.length === members.length) {
                        setEditSelectedMembers([]);
                      } else {
                        setEditSelectedMembers(newSelected);
                      }
                    }}
                  />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
          </div>
          {(editSelectedMembers.length === 0 ? members.length > 0 : editSelectedMembers.length > 0) && (
            <>
              <div className="flex gap-4 items-center mt-2">
                <label className="font-semibold">Divisão:</label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={editShareType === 'value'}
                    onChange={() => setEditShareType('value')}
                  /> Valor
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={editShareType === 'percent'}
                    onChange={() => setEditShareType('percent')}
                  /> Porcentagem
                </label>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {(editSelectedMembers.length === 0 ? members.map(m => m.id) : editSelectedMembers).map(memberId => {
                  const member = members.find(m => m.id === memberId);
                  const share = editShares.find(s => s.memberId === memberId);
                  return (
                    <div key={memberId} className="flex items-center gap-2">
                      <span className="w-32 truncate">{member?.name}</span>
                      <input
                        type="number"
                        min={editShareType === 'percent' ? '0' : undefined}
                        step="0.01"
                        value={share?.amount ?? 0}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setEditShares(prev => prev.map(s => s.memberId === memberId ? { ...s, amount: val } : s));
                        }}
                        className="w-28 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-neutral-900 dark:text-neutral-100"
                        placeholder={editShareType === 'value' ? 'Valor' : '%'}
                      />
                      {editShareType === 'value' && editValue && (
                        <span className="text-xs text-neutral-500">({((share?.amount ?? 0) / parseFloat(editValue) * 100).toFixed(1)}%)</span>
                      )}
                      {editShareType === 'percent' && editValue && (
                        <span className="text-xs text-neutral-500">(R$ {((share?.amount ?? 0) * parseFloat(editValue) / 100).toFixed(2)})</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-sm mt-2">
                Soma total: {editShareType === 'value'
                  ? `R$ ${editShares.reduce((acc, s) => acc + ((editSelectedMembers.length === 0 ? members.map(m => m.id) : editSelectedMembers).includes(s.memberId) ? s.amount : 0), 0).toFixed(2)}`
                  : `${editShares.reduce((acc, s) => acc + ((editSelectedMembers.length === 0 ? members.map(m => m.id) : editSelectedMembers).includes(s.memberId) ? s.amount : 0), 0).toFixed(2)}%`}
              </div>
            </>
          )}
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
              Total por pessoa (média): <span className="font-extrabold">R$ {members.length > 0 ? (bills.reduce((acc, b) => acc + b.value, 0) / members.length).toFixed(2) : "0.00"}</span>
            </div>
            {/* Totais por membro */}
            {members.length > 0 && (
              <div className="mt-4">
                <div className="text-emerald-900 dark:text-emerald-200 text-lg font-bold mb-2">Total individual por membro:</div>
                <div className="flex flex-col gap-1">
                  {members.map(member => {
                    // Soma todas as contas em que o membro participa
                    let total = 0;
                    bills.forEach(bill => {
                      if (bill.shares && bill.shares.length > 0) {
                        const share = bill.shares.find(s => s.memberId === member.id);
                        if (share) {
                          if (share.type === 'value') total += share.amount;
                          if (share.type === 'percent') total += (share.amount * bill.value) / 100;
                        }
                      } else {
                        // Se não houver shares, dividir igualmente entre todos do grupo
                        total += bill.value / members.length;
                      }
                    });
                    return (
                      <div key={member.id} className="flex gap-2 items-center text-base">
                        <span className="font-semibold">{member.name}:</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              className="rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-300"
              onClick={handleOpenAddModal}
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
                step="0.01"
                className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              />
              <div>
                <label className="block font-semibold mb-1">Participantes:</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1 font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedMembers.length === 0}
                      onChange={() => {
                        if (selectedMembers.length === 0) {
                          // Desmarcar todos
                          setSelectedMembers(members.map(m => m.id));
                        } else {
                          // Marcar todos
                          setSelectedMembers([]);
                        }
                      }}
                    />
                    Todos
                  </label>
                  {members.map(m => (
                    <label key={m.id} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={selectedMembers.length === 0 || selectedMembers.includes(m.id)}
                        onChange={e => {
                          let newSelected;
                          if (selectedMembers.length === 0) {
                            // Se estava "Todos", remover só esse
                            newSelected = members.filter(mem => mem.id !== m.id).map(mem => mem.id);
                          } else if (e.target.checked) {
                            newSelected = [...selectedMembers, m.id];
                          } else {
                            newSelected = selectedMembers.filter(id => id !== m.id);
                          }
                          // Se todos marcados individualmente, ativa "Todos"
                          if (newSelected.length === members.length) {
                            setSelectedMembers([]);
                          } else {
                            setSelectedMembers(newSelected);
                          }
                        }}
                      />
                      <span>{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {(selectedMembers.length === 0 ? members.length > 0 : selectedMembers.length > 0) && (
                <>
                  <div className="flex gap-4 items-center mt-2">
                    <label className="font-semibold">Divisão:</label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={shareType === 'value'}
                        onChange={() => setShareType('value')}
                      /> Valor
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={shareType === 'percent'}
                        onChange={() => setShareType('percent')}
                      /> Porcentagem
                    </label>
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {(selectedMembers.length === 0 ? members.map(m => m.id) : selectedMembers).map(memberId => {
                      const member = members.find(m => m.id === memberId);
                      const share = shares.find(s => s.memberId === memberId);
                      return (
                        <div key={memberId} className="flex items-center gap-2">
                          <span className="w-32 truncate">{member?.name}</span>
                          <input
                            type="number"
                            min={shareType === 'percent' ? '0' : undefined}
                            step="0.01"
                            value={share?.amount ?? 0}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setShares(prev => prev.map(s => s.memberId === memberId ? { ...s, amount: val } : s));
                            }}
                            className="w-28 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 text-neutral-900 dark:text-neutral-100"
                            placeholder={shareType === 'value' ? 'Valor' : '%'}
                          />
                          {shareType === 'value' && value && (
                            <span className="text-xs text-neutral-500">({((share?.amount ?? 0) / parseFloat(value) * 100).toFixed(1)}%)</span>
                          )}
                          {shareType === 'percent' && value && (
                            <span className="text-xs text-neutral-500">(R$ {((share?.amount ?? 0) * parseFloat(value) / 100).toFixed(2)})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-sm mt-2">
                    Soma total: {shareType === 'value'
                      ? `R$ ${shares.reduce((acc, s) => acc + ((selectedMembers.length === 0 ? members.map(m => m.id) : selectedMembers).includes(s.memberId) ? s.amount : 0), 0).toFixed(2)}`
                      : `${shares.reduce((acc, s) => acc + ((selectedMembers.length === 0 ? members.map(m => m.id) : selectedMembers).includes(s.memberId) ? s.amount : 0), 0).toFixed(2)}%`}
                  </div>
                </>
              )}
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
