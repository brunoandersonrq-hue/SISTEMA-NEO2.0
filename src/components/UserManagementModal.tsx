import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  LogOut,
  Users,
  Edit2,
  Power,
  PowerOff,
  ShieldAlert,
  Check,
  Ban,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserAccount, UserRole } from '../types.ts';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  users: UserAccount[];
  onUpdatePassword: (userId: string, newPass: string) => void;
  onCreateUser: (newUser: Omit<UserAccount, 'id' | 'criadoEm'>) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onLogout: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onUpdatePassword,
  onCreateUser,
  onUpdateUser,
  onToggleUserStatus,
  onDeleteUser,
  onLogout
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'admin';

  const [activeTab, setActiveTab] = useState<'perfil' | 'usuarios'>('perfil');
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New user form state (admin only)
  const [newUsername, setNewUsername] = useState('');
  const [newNome, setNewNome] = useState('');
  const [newCargo, setNewCargo] = useState('Portaria');
  const [newRole, setNewRole] = useState<UserRole>('portaria');
  const [newPassword, setNewPassword] = useState('');

  // Edit user state (admin only)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('portaria');
  const [editPassword, setEditPassword] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Inline confirmation state for toggle/delete (replaces window.confirm which is blocked in iframes!)
  const [pendingAction, setPendingAction] = useState<{
    type: 'toggle' | 'delete';
    user: UserAccount;
  } | null>(null);

  if (!isOpen) return null;

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassInput !== currentUser.senhaHash) {
      showFeedback('A senha atual informada está incorreta.', 'error');
      return;
    }
    if (!newPassInput || newPassInput.length < 4) {
      showFeedback('A nova senha deve ter no mínimo 4 caracteres.', 'error');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      showFeedback('A confirmação da nova senha não confere.', 'error');
      return;
    }

    onUpdatePassword(currentUser.id, newPassInput);
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
    showFeedback('Senha alterada com sucesso!', 'success');
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('Apenas o usuário administrador pode cadastrar usuários.', 'error');
      return;
    }

    const cleanUser = newUsername.trim().toLowerCase();
    if (!cleanUser || !newPassword || !newNome) {
      showFeedback('Preencha todos os campos do operador.', 'error');
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUser)) {
      showFeedback('Já existe um usuário com esse nome de login.', 'error');
      return;
    }

    onCreateUser({
      username: cleanUser,
      nome: newNome.trim(),
      cargo: newCargo.trim() || 'Portaria',
      role: newRole,
      status: 'ativo',
      senhaHash: newPassword.trim()
    });

    setNewUsername('');
    setNewNome('');
    setNewPassword('');
    showFeedback(`Operador "${cleanUser}" cadastrado com sucesso!`, 'success');
  };

  const handleStartEdit = (user: UserAccount) => {
    if (!isAdmin) {
      showFeedback('Apenas administradores podem editar usuários.', 'error');
      return;
    }
    setEditingUserId(user.id);
    setEditNome(user.nome);
    setEditCargo(user.cargo);
    setEditRole(user.role);
    setEditPassword('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditNome('');
    setEditCargo('');
    setEditPassword('');
  };

  const handleSaveEdit = (userId: string) => {
    if (!isAdmin) {
      showFeedback('Permissão negada: apenas administrador pode editar.', 'error');
      return;
    }
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (!editNome.trim()) {
      showFeedback('O nome não pode ficar vazio.', 'error');
      return;
    }

    const updated: UserAccount = {
      ...targetUser,
      nome: editNome.trim(),
      cargo: editCargo.trim() || targetUser.cargo,
      role: editRole,
      senhaHash: editPassword.trim() ? editPassword.trim() : targetUser.senhaHash
    };

    onUpdateUser(updated);
    setEditingUserId(null);
    showFeedback(`Dados do operador "${targetUser.username}" atualizados com sucesso!`, 'success');
  };

  // Immediate toggle and delete directly without window.confirm (which is blocked by browser in iframes)
  const handleToggleStatusClick = (user: UserAccount) => {
    if (!isAdmin) {
      showFeedback('Apenas o administrador pode alterar o status de outros usuários.', 'error');
      return;
    }

    if (user.id === currentUser.id) {
      showFeedback('Você não pode desativar seu próprio usuário atual.', 'error');
      return;
    }

    setPendingAction({ type: 'toggle', user });
  };

  const handleDeleteClick = (user: UserAccount) => {
    if (!isAdmin) {
      showFeedback('Apenas o administrador pode excluir usuários.', 'error');
      return;
    }

    if (user.id === currentUser.id) {
      showFeedback('Você não pode excluir sua própria conta conectada.', 'error');
      return;
    }

    setPendingAction({ type: 'delete', user });
  };

  const confirmPendingAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'toggle') {
      const u = pendingAction.user;
      onToggleUserStatus(u.id);
      const isCurrentlyInactive = u.status === 'inativo';
      showFeedback(
        `Operador "${u.nome}" agora está ${isCurrentlyInactive ? 'ATIVO' : 'INATIVO'}.`,
        'success'
      );
    } else if (pendingAction.type === 'delete') {
      const u = pendingAction.user;
      onDeleteUser(u.id);
      showFeedback(`Operador "${u.nome}" foi removido do sistema.`, 'success');
    }

    setPendingAction(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isAdmin ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-blue-600/30 text-blue-300 border-blue-500/30'}`}>
              {isAdmin ? <Shield className="w-5 h-5 text-amber-400" /> : <User className="w-5 h-5 text-blue-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Controle de Usuários & Operadores
                </h2>
                {isAdmin ? (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Administrador
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Operador
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logado como <strong className="text-white">{currentUser.nome || currentUser.username}</strong> ({currentUser.cargo})
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'perfil'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Meu Perfil / Trocar Senha</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('usuarios')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'usuarios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              Gestão de Operadores ({users.length})
              {!isAdmin && <span className="text-[10px] text-slate-400 ml-1 font-normal">(Somente Leitura)</span>}
            </span>
          </button>
        </div>

        {/* Inline Confirmation Prompt (replaces window.confirm) */}
        {pendingAction && (
          <div className="p-4 bg-amber-50 border-b border-amber-200 animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {pendingAction.type === 'delete' ? (
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    {pendingAction.user.status === 'inativo' ? (
                      <Power className="w-4 h-4" />
                    ) : (
                      <PowerOff className="w-4 h-4" />
                    )}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {pendingAction.type === 'delete'
                      ? `Excluir definitivamente o operador "${pendingAction.user.nome}"?`
                      : pendingAction.user.status === 'inativo'
                      ? `Reativar o operador "${pendingAction.user.nome}"?`
                      : `Deixar o operador "${pendingAction.user.nome}" inativo? (Bloqueará login)`}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {pendingAction.type === 'delete'
                      ? 'Esta ação não poderá ser desfeita.'
                      : 'Você poderá alterar o status novamente a qualquer momento.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPendingAction(null)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmPendingAction}
                  className={`px-3 py-1 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer ${
                    pendingAction.type === 'delete'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback message */}
        {feedbackMsg && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Modal content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {activeTab === 'perfil' ? (
            <div className="space-y-6">
              {/* User details card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Conta Conectada</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{currentUser.nome}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${currentUser.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {currentUser.role === 'admin' ? 'Administrador' : 'Operador'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Usuário: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">{currentUser.username}</code> &bull; Função: {currentUser.cargo}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair (Logout)</span>
                </button>
              </div>

              {/* Password update form */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Alterar Minha Senha de Acesso</span>
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    required
                    placeholder="Digite a sua senha atual"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={newPassInput}
                      onChange={(e) => setNewPassInput(e.target.value)}
                      required
                      placeholder="Mínimo 4 caracteres"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassInput}
                      onChange={(e) => setConfirmPassInput(e.target.value)}
                      required
                      placeholder="Repita a nova senha"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Salvar Nova Senha
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Permission notice banner */}
              {!isAdmin && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Apenas o usuário Administrador</strong> possui permissão para editar, excluir ou inativar contas de operadores.
                  </span>
                </div>
              )}

              {/* List of users */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Operadores Cadastrados
                  </h4>
                  <span className="text-xs text-slate-500">
                    Total: <strong>{users.length}</strong>
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    const isUserInactive = u.status === 'inativo';
                    const isEditingThis = editingUserId === u.id;

                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 transition-colors ${
                          isUserInactive
                            ? 'bg-slate-100/80 opacity-75'
                            : 'bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        {isEditingThis ? (
                          /* Inline edit form for Administrator */
                          <div className="space-y-3 bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editando: {u.username}</span>
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">ID: {u.id}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Nome Completo
                                </label>
                                <input
                                  type="text"
                                  value={editNome}
                                  onChange={(e) => setEditNome(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Cargo / Função
                                </label>
                                <input
                                  type="text"
                                  value={editCargo}
                                  onChange={(e) => setEditCargo(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Nível de Acesso
                                </label>
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                                  disabled={u.username === 'admin'}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs disabled:bg-slate-100"
                                >
                                  <option value="portaria">Portaria / Recepção</option>
                                  <option value="admin">Administrador</option>
                                  <option value="governanca">Governança</option>
                                </select>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[11px] font-semibold text-slate-600">
                                    Redefinir Senha (opcional)
                                  </label>
                                  <span className="text-[10px] text-amber-800 font-medium">
                                    Atual: <code className="font-mono font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200">{u.senhaHash}</code>
                                  </span>
                                </div>
                                <input
                                  type="password"
                                  value={editPassword}
                                  onChange={(e) => setEditPassword(e.target.value)}
                                  placeholder="Deixe em branco p/ manter atual"
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(u.id)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Salvar Alterações</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal row view */
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${isUserInactive ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                  {u.nome}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                                    Você
                                  </span>
                                )}
                                {u.role === 'admin' ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                    Admin
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                    {u.role}
                                  </span>
                                )}
                                {isUserInactive ? (
                                  <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-1">
                                    <Ban className="w-3 h-3" />
                                    <span>Inativo</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>Ativo</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Usuário: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">{u.username}</code> &bull; Cargo: {u.cargo}
                              </p>

                              {/* Show current password ONLY for Administrator */}
                              {isAdmin && (
                                <div className="mt-1.5 inline-flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 rounded-lg px-2 py-0.5 text-[11px] text-slate-700">
                                  <KeyRound className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span className="font-medium text-slate-600">Senha atual:</span>
                                  <code className="font-mono font-bold text-amber-950 bg-amber-100/70 px-1.5 py-0.2 rounded border border-amber-300/50">
                                    {(revealedPasswords[u.id] ?? true) ? u.senhaHash : '••••••••'}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedPasswords((prev) => ({
                                        ...prev,
                                        [u.id]: !(prev[u.id] ?? true)
                                      }))
                                    }
                                    className="p-0.5 text-slate-500 hover:text-slate-900 rounded transition-colors cursor-pointer ml-0.5"
                                    title={(revealedPasswords[u.id] ?? true) ? 'Ocultar senha' : 'Ver senha atual'}
                                  >
                                    {(revealedPasswords[u.id] ?? true) ? (
                                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Actions available ONLY to Administrator */}
                            {isAdmin ? (
                              <div className="flex items-center gap-1 self-end sm:self-center">
                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(u)}
                                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200"
                                  title="Editar dados e senha do usuário"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Toggle Active/Inactive */}
                                {!isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatusClick(u)}
                                    className={`p-2 rounded-lg transition-colors cursor-pointer border ${
                                      isUserInactive
                                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                                        : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                    }`}
                                    title={isUserInactive ? 'Reativar acesso do usuário' : 'Deixar usuário inativo (bloquear login)'}
                                  >
                                    {isUserInactive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                  </button>
                                )}

                                {/* Delete Button */}
                                {!isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClick(u)}
                                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                                    title="Excluir usuário permanentemente"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Gerenciado pelo Admin
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add new user form - Administrator ONLY */}
              {isAdmin ? (
                <form onSubmit={handleCreateNewUser} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    <span>Cadastrar Novo Operador / Usuário</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={newNome}
                        onChange={(e) => setNewNome(e.target.value)}
                        placeholder="Ex: Carlos Silva"
                        required
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Usuário para Login
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Ex: carlos"
                        required
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Cargo / Função
                      </label>
                      <input
                        type="text"
                        value={newCargo}
                        onChange={(e) => setNewCargo(e.target.value)}
                        placeholder="Ex: Portaria Noturna"
                        required
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Perfil de Acesso
                      </label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as UserRole)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="portaria">Portaria / Recepção</option>
                        <option value="admin">Administrador</option>
                        <option value="governanca">Governança</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Senha Inicial
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Defina a senha"
                        required
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Operador</span>
                  </button>
                </form>
              ) : (
                <div className="text-center p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500">
                  <Shield className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <span>Cadastros e modificações de contas estão restritos ao usuário administrador.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
