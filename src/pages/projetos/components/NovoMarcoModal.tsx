import Modal from "@/components/ui/Modal";
import { useState } from "react";
import { useCriarMarco } from "@/hooks/useMarcos";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NovoMarcoModal({ open, onClose }: Props) {
  const criarMarco = useCriarMarco();
  const [form, setForm] = useState({
    descricao: "",
    data_prevista: "",
    data_real: "",
  });
  const [erro, setErro] = useState("");

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!form.descricao || !form.data_prevista || !form.data_real) {
      setErro("Preencha todos os campos.");
      return;
    }
    try {
      const response = await criarMarco.mutateAsync(form);
      console.log(response)
      setForm({ descricao: "", data_prevista: "", data_real: "" });
      onClose();
    } catch {
      setErro("Erro ao criar marco. Tente novamente.");
    }
  };

  const handleClose = () => {
    setForm({ descricao: "", data_prevista: "", data_real: "" });
    setErro("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Novo Marco">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Descrição <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={form.descricao}
            onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
            className="input-field"
            placeholder="Ex: Marco de fundação"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Data Prevista <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={form.data_prevista}
              onChange={(e) => setForm((p) => ({ ...p, data_prevista: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Data Real <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={form.data_real}
              onChange={(e) => setForm((p) => ({ ...p, data_real: e.target.value }))}
              className="input-field"
            />
          </div>
        </div>

        {erro && <p className="text-danger text-xs">{erro}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={criarMarco.isPending} className="btn-primary">
            {criarMarco.isPending ? "Criando..." : "Criar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}