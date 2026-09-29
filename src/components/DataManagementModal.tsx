import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  Database,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Package,
  BookOpen,
  Building2,
  Layers,
  Flame,
  Info,
  Gamepad2,
  Dumbbell
} from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  counts: {
    reservations: number;
    packages: number;
    incidents: number;
    amenities: number;
    apartments: number;
    gamesRoom: number;
    gym: number;
  };
  onClearReservations: () => void;
  onClearPackages: () => void;
  onClearIncidents: () => void;
  onClearAmenities: () => void;
  onClearHousekeeping: () => void;
  onClearGamesRoom: () => void;
  onClearGym: () => void;
  onClearAllDemoData: () => void;
  onRestoreDemoData: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  counts,
  onClearReservations,
  onClearPackages,
  onClearIncidents,
  onClearAmenities,
  onClearHousekeeping,
  onClearGamesRoom,
  onClearGym,
  onClearAllDemoData,
  onRestoreDemoData
}) => {
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (fn: () => void, message: string) => {
    fn();
    setActionSuccess(message);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-500/30">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gerenciar Dados & Limpar Exemplos</span>
              </h2>
              <p className="text-xs text-slate-400">
                Limpe os dados de demonstração para iniciar o uso real do condomínio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-3 flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* Explanation Banner */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-blue-950">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-900">Como funciona o armazenamento?</p>
              <p className="text-blue-800">
                Todos os dados ficam salvos de forma privada no seu próprio navegador (<code className="bg-blue-100 px-1 py-0.5 rounded text-[11px]">LocalStorage</code>).
                Você pode limpar tudo com 1 clique para começar a cadastrar as informações reais do seu condomínio ou limpar módulos individualmente.
              </p>
            </div>
          </div>

          {/* Quick Action: Clear All Demo Data */}
          <div className="bg-rose-50/70 border-2 border-rose-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    Limpar Todos os Dados de Exemplo
                  </h3>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Remove todas as reservas, encomendas, ocorrências e escala de camareiras de exemplo.
                    O cadastro estrutural dos {counts.apartments} apartamentos cadastrados é mantido pronto para uso.
                  </p>
                </div>
              </div>
            </div>

            {confirmClearAll ? (
              <div className="bg-white p-3.5 rounded-xl border border-rose-300 space-y-2.5">
                <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Tem certeza? Todos os registros de teste serão apagados agora.</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClearAll(false);
                      handleAction(onClearAllDemoData, 'Todos os dados de exemplo foram removidos com sucesso! Sistema zerado.');
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Sim, Limpar Tudo Agora
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar Todos os Dados de Teste</span>
              </button>
            )}
          </div>

          {/* Module-by-module cleanup */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Limpar Módulos Individualmente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reservas & Hospedagem */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Reservas / Hóspedes</p>
                    <p className="text-[11px] text-slate-500">{counts.reservations} cadastradas</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(onClearReservations, 'Reservas de exemplo removidas.')}
                  disabled={counts.reservations === 0}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-700"
                >
                  Limpar
                </button>
              </div>

              {/* Camareiras */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-pink-100 text-pink-800">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Escala Camareiras</p>
                    <p className="text-[11px] text-slate-500">Grade & Anotações</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(onClearHousekeeping, 'Escala de camareiras resetada.')}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer text-slate-700"
                >
                  Limpar
                </button>
              </div>

              {/* Encomendas */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Encomendas</p>
                    <p className="text-[11px] text-slate-500">{counts.packages} registradas</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(onClearPackages, 'Encomendas de exemplo removidas.')}
                  disabled={counts.packages === 0}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-700"
                >
                  Limpar
                </button>
              </div>

              {/* Ocorrências */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Livro Ocorrências</p>
                    <p className="text-[11px] text-slate-500">{counts.incidents} registros</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(onClearIncidents, 'Ocorrências de exemplo removidas.')}
                  disabled={counts.incidents === 0}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-700"
                >
                  Limpar
                </button>
              </div>

              {/* Salão / Espaços */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-800">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Espaços / Salão</p>
                    <p className="text-[11px] text-slate-500">{counts.amenities} agendamentos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(onClearAmenities, 'Reservas de espaços removidas.')}
                  disabled={counts.amenities === 0}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-700"
                >
                  Limpar
                </button>
              </div>

              {/* Sala de Jogos */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-cyan-100 text-cyan-800">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Sala de Jogos</p>
                    <p className="text-[11px] text-slate-500">{counts.gamesRoom} empréstimos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(onClearGamesRoom, 'Registros da Sala de Jogos removidos.')}
                  disabled={counts.gamesRoom === 0}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-700"
                >
                  Limpar
                </button>
              </div>

              {/* Sala Academia */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Sala Academia</p>
                    <p className="text-[11px] text-slate-500">{counts.gym} chaves/tags</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(onClearGym, 'Registros da Sala Academia removidos.')}
                  disabled={counts.gym === 0}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-700"
                >
                  Limpar
                </button>
              </div>

              {/* Apartamentos */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{counts.apartments} Cadastros</p>
                    <p className="text-[11px] text-slate-500">Unidades Cadastradas</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded">
                  Base Fixa
                </span>
              </div>
            </div>
          </div>

          {/* Restore demo data option */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800">Deseja restaurar os dados de demonstração?</p>
              <p className="text-[11px] text-slate-500">Recarrega os exemplos originais para demonstração ou treinamento.</p>
            </div>

            {confirmRestore ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmRestore(false);
                    handleAction(onRestoreDemoData, 'Dados de demonstração restaurados!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Confirmar Restauração
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRestore(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRestore(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Dados Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
